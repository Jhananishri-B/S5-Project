const STORAGE_KEY = 'learnbridge_learning_v1'

const defaultState = () => ({
    sessions: [],
    bookmarks: [],
    islBookmarks: [],
    islRequests: [],
    youtubeTabUrl: 'https://www.youtube.com',
})

function readRaw() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return defaultState()
        const parsed = JSON.parse(raw)
        return { ...defaultState(), ...parsed, sessions: parsed.sessions || [] }
    } catch {
        return defaultState()
    }
}

function writeRaw(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    window.dispatchEvent(new Event('learnbridge-storage'))
}

export function getLearningState() {
    return readRaw()
}

export function subscribeLearningStore(callback) {
    const handler = () => callback(getLearningState())
    window.addEventListener('learnbridge-storage', handler)
    window.addEventListener('storage', handler)
    return () => {
        window.removeEventListener('learnbridge-storage', handler)
        window.removeEventListener('storage', handler)
    }
}

export function setYoutubeTabUrl(url) {
    const state = readRaw()
    state.youtubeTabUrl = url || 'https://www.youtube.com'
    writeRaw(state)
}

export function youtubeSearchUrl(query) {
    const q = encodeURIComponent(query || 'education')
    return `https://www.youtube.com/results?search_query=${q}`
}

export function buildGeneratedContent({ title, subject, gradeLevel, outputLanguage, explanationLevel, options, includeDiagrams }) {
    const topic = title || 'Your topic'
    const sentences = [
        `Introduction to ${topic} (${subject}).`,
        `Prepared for ${gradeLevel} in ${outputLanguage}.`,
        `Explanation level: ${explanationLevel}.`,
        `Summary: core ideas of ${topic} in accessible language.`,
    ]
    const notes =
        options?.simplifiedNotes !== false
            ? `Simplified notes for "${topic}": ${sentences.join(' ')}`
            : ''
    const transcript =
        options?.transcript !== false
            ? sentences.map((text, i) => ({
                  time: `00:${String(i * 7).padStart(2, '0')}`,
                  text,
              }))
            : []
    const words = topic.split(/\s+/).filter((w) => w.length > 2)
    const keyTerms =
        options?.keyTerms !== false
            ? (words.length ? words : [topic]).slice(0, 6).map((term) => ({
                  term: term.replace(/[^\w-]/g, ''),
                  def: `Key idea from ${topic} (${subject}).`,
              }))
            : []
    const practiceQuestions =
        options?.practiceQuestions !== false
            ? [
                  { q: `Which subject is "${topic}" grouped under?`, a: subject },
                  { q: `What level is this material aimed at?`, a: gradeLevel },
              ]
            : []
    return {
        notes,
        transcript,
        keyTerms,
        practiceQuestions,
        hasDiagram: !!(options?.diagrams && includeDiagrams),
        hasIsl: !!options?.islVideo,
    }
}

export function addLearningSession(payload) {
    const state = readRaw()
    const now = new Date().toISOString()
    const title = payload.title || 'Untitled topic'
    const session = {
        id: payload.id || `sess-${Date.now()}`,
        title,
        subject: payload.subject || 'General',
        progress: payload.progress ?? 0,
        notes: payload.notes || '',
        islVideoUrl: payload.islVideoUrl ?? null,
        youtubeUrl: payload.youtubeUrl || youtubeSearchUrl(title),
        sourceFile: payload.sourceFile || null,
        createdAt: now,
        updatedAt: now,
        materials: {
            notes: payload.materials?.notes !== false,
            diagram: !!payload.materials?.diagram,
            islVideo: !!payload.materials?.islVideo,
            quiz: !!payload.materials?.quiz,
        },
        settings: payload.settings || null,
        generated: payload.generated || null,
    }
    state.sessions = [session, ...state.sessions.filter((s) => s.id !== session.id)]
    writeRaw(state)
    return session
}

export function updateSession(id, patch) {
    const state = readRaw()
    const idx = state.sessions.findIndex((s) => s.id === id)
    if (idx === -1) return null
    state.sessions[idx] = {
        ...state.sessions[idx],
        ...patch,
        updatedAt: new Date().toISOString(),
    }
    writeRaw(state)
    return state.sessions[idx]
}

export function toggleBookmark(sessionId) {
    const state = readRaw()
    const set = new Set(state.bookmarks || [])
    if (set.has(sessionId)) set.delete(sessionId)
    else set.add(sessionId)
    state.bookmarks = [...set]
    writeRaw(state)
}

export function isBookmarked(sessionId) {
    return (readRaw().bookmarks || []).includes(sessionId)
}

function dayKey(iso) {
    return iso.slice(0, 10)
}

export function computeDashboardMetrics(sessions) {
    const completed = sessions.filter((s) => s.progress >= 100).length
    const materialCount = sessions.reduce((n, s) => {
        let c = 0
        if (s.materials?.notes) c++
        if (s.materials?.diagram) c++
        if (s.materials?.islVideo) c++
        if (s.materials?.quiz) c++
        return n + c
    }, 0)

    const studyMinutes = sessions.length * 45
    const hours = (studyMinutes / 60).toFixed(1)

    const days = new Set(sessions.map((s) => dayKey(s.updatedAt || s.createdAt)))
    let streak = 0
    const d = new Date()
    for (;;) {
        const key = d.toISOString().slice(0, 10)
        if (days.has(key)) {
            streak++
            d.setDate(d.getDate() - 1)
        } else break
    }

    const subjectMap = {}
    sessions.forEach((s) => {
        const subj = s.subject || 'General'
        if (!subjectMap[subj]) subjectMap[subj] = { total: 0, sum: 0 }
        subjectMap[subj].total++
        subjectMap[subj].sum += s.progress || 0
    })
    const colors = ['#10b981', '#a855f7', '#3b82f6', '#f59e0b', '#2563eb']
    const subjectProgress = Object.entries(subjectMap).map(([subject, v], i) => ({
        subject,
        progress: Math.round(v.sum / v.total),
        color: colors[i % colors.length],
    }))

    return {
        materialCount,
        topicsCompleted: completed,
        topicsTotal: Math.max(sessions.length, completed, 1),
        studyHours: hours,
        streak,
        subjectProgress,
    }
}

export function sessionToMaterialCards(session) {
    const cards = []
    const base = {
        sessionId: session.id,
        subject: session.subject,
        title: session.title,
    }
    if (session.materials?.notes) {
        cards.push({
            ...base,
            id: `${session.id}-notes`,
            type: 'notes',
            badge: 'Simplified Notes',
            badgeType: 'blue',
            meta: session.notes ? `${Math.min(session.notes.split(/\s+/).length, 999)} words` : 'Saved notes',
            action: 'Open →',
            notes: session.notes,
            islVideoUrl: session.islVideoUrl,
        })
    }
    if (session.materials?.diagram) {
        cards.push({
            ...base,
            id: `${session.id}-diagram`,
            type: 'diagram',
            badge: 'Visual Diagram',
            badgeType: 'blue',
            meta: 'Generated',
            action: 'Open →',
        })
    }
    if (session.materials?.islVideo) {
        cards.push({
            ...base,
            id: `${session.id}-isl`,
            type: 'video',
            badge: 'ISL Video',
            badgeType: 'blue',
            meta: session.islVideoUrl ? 'Ready' : 'Pending API',
            action: 'Watch →',
            islVideoUrl: session.islVideoUrl,
        })
    }
    if (session.materials?.quiz) {
        cards.push({
            ...base,
            id: `${session.id}-quiz`,
            type: 'quiz',
            badge: 'Practice Quiz',
            badgeType: 'orange',
            meta: 'Practice',
            action: 'Attempt →',
        })
    }
    return cards
}

export function getISLTermsCatalog() {
    const sessions = readRaw().sessions || []
    const bySession = {}
    const terms = []
    const seen = new Set()

    const pushTerm = (session, termName, description) => {
        const term = (termName || '').trim()
        if (!term) return
        const id = `${session.id}::${term.toLowerCase()}`
        if (seen.has(id)) return
        seen.add(id)
        const gradeLevel = session.settings?.gradeLevel || 'Not set'
        const entry = {
            id,
            term,
            subject: session.subject || 'General',
            gradeLevel,
            verified: !!session.islVideoUrl,
            availability: session.islVideoUrl ? 'verified' : 'pending',
            description: description || `Sign language resource for "${term}" (${session.subject || 'General'}).`,
            keyPoints: (session.notes || '')
                .split(/[.!?]+/)
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 5),
            relatedTerms: [],
            videoUrl: session.islVideoUrl || session.youtubeUrl || youtubeSearchUrl(term),
            sessionId: session.id,
        }
        terms.push(entry)
        if (!bySession[session.id]) bySession[session.id] = []
        bySession[session.id].push(entry)
    }

    sessions.forEach((session) => {
        if (session.materials?.islVideo || session.materials?.notes) {
            pushTerm(session, session.title, session.notes?.slice(0, 240))
        }
        ;(session.generated?.keyTerms || []).forEach((kt) => pushTerm(session, kt.term, kt.def))
    })

    Object.values(bySession).forEach((group) => {
        const names = group.map((t) => t.term)
        group.forEach((t) => {
            t.relatedTerms = names.filter((n) => n !== t.term).slice(0, 6)
        })
    })

    return terms
}

export function computeISLStats(terms) {
    const subjects = new Set(terms.map((t) => t.subject))
    const verified = terms.filter((t) => t.verified).length
    const total = terms.length
    return {
        videoCount: verified,
        termCount: total,
        subjectCount: subjects.size,
        coveragePct: total ? Math.round((verified / total) * 100) : 0,
        subjects,
    }
}

export function toggleIslBookmark(termId) {
    const state = readRaw()
    const set = new Set(state.islBookmarks || [])
    if (set.has(termId)) set.delete(termId)
    else set.add(termId)
    state.islBookmarks = [...set]
    writeRaw(state)
}

export function isIslBookmarked(termId) {
    return (readRaw().islBookmarks || []).includes(termId)
}

export function addIslTermRequest(termName) {
    const name = termName?.trim()
    if (!name) return false
    const state = readRaw()
    state.islRequests = [{ term: name, at: new Date().toISOString() }, ...(state.islRequests || [])]
    writeRaw(state)
    return true
}

export function getQuizQuestions(sessions, sessionId = null) {
    const list = sessionId ? sessions.filter((s) => s.id === sessionId) : sessions
    const out = []
    list.forEach((s) => {
        ;(s.generated?.practiceQuestions || []).forEach((pq, i) => {
            out.push({
                id: `${s.id}-q${i}`,
                question: pq.q,
                options: [
                    { id: 'A', text: pq.a, correct: true },
                    { id: 'B', text: 'Not sure' },
                    { id: 'C', text: 'None of these' },
                    { id: 'D', text: 'Skip' },
                ],
                explanation: `From your material: ${s.title}.`,
                diagram: null,
                sessionTitle: s.title,
            })
        })
    })
    return out
}

export function computeQualityMetrics() {
    const state = readRaw()
    const sessions = state.sessions || []
    const requests = state.islRequests || []
    const emptySummary = {
        captionAccuracy: { score: 0, status: 'No data', target: 90 },
        islCoverage: { score: 0, status: 'No data', target: 80 },
        readabilityScore: { score: 0, status: 'No data', target: 85 },
        overallQuality: { score: 0, status: 'Awaiting content', target: 85 },
    }
    if (!sessions.length) {
        return {
            summary: emptySummary,
            evaluations: [],
            missingTerms: requests.map((r) => ({ term: r.term, subject: '—', priority: 'Requested', requests: 1 })),
            coverageBreakdown: [
                { name: 'Accurate Captions', pct: 0, color: '#2563eb' },
                { name: 'Visual Diagrams', pct: 0, color: '#10b981' },
                { name: 'Simplified Notes', pct: 0, color: '#3b82f6' },
                { name: 'ISL Sign Videos', pct: 0, color: '#f59e0b' },
            ],
            compare: null,
            reviewQueue: [],
        }
    }
    const n = sessions.length
    const pct = (c) => Math.round((c / n) * 100)
    const cap = pct(sessions.filter((s) => (s.generated?.transcript || []).length).length)
    const isl = pct(sessions.filter((s) => s.islVideoUrl).length)
    const read = pct(sessions.filter((s) => s.notes).length)
    const overall = Math.round((cap + isl + read) / 3)
    const summary = {
        captionAccuracy: { score: cap, status: cap >= 90 ? 'Excellent' : cap ? 'In progress' : 'No data', target: 90 },
        islCoverage: { score: isl, status: isl >= 80 ? 'Good' : isl ? 'In progress' : 'No data', target: 80 },
        readabilityScore: { score: read, status: read >= 85 ? 'High Accessibility' : 'In progress', target: 85 },
        overallQuality: { score: overall, status: overall >= 85 ? 'Ready' : 'In progress', target: 85 },
    }
    const evaluations = sessions.map((s) => ({
        id: s.id,
        topic: s.title,
        subject: s.subject,
        captionScore: (s.generated?.transcript || []).length ? `${Math.min(100, (s.generated.transcript.length || 1) * 25)}%` : '—',
        islAvailable: s.islVideoUrl ? 'Verified' : s.materials?.islVideo ? 'Pending' : '—',
        readabilityGrade: s.settings?.explanationLevel || '—',
        status: s.islVideoUrl ? 'Approved' : s.progress >= 50 ? 'Under Review' : 'Needs Revision',
    }))
    const pending = getISLTermsCatalog().filter((t) => !t.verified)
    const missingTerms = [
        ...requests.map((r) => ({ term: r.term, subject: '—', priority: 'Requested', requests: 1 })),
        ...pending.map((t) => ({ term: t.term, subject: t.subject, priority: 'High', requests: 0 })),
    ].slice(0, 12)
    const coverageBreakdown = [
        { name: 'Accurate Captions', pct: cap, color: '#2563eb' },
        { name: 'Visual Diagrams', pct: pct(sessions.filter((s) => s.materials?.diagram).length), color: '#10b981' },
        { name: 'Simplified Notes', pct: read, color: '#3b82f6' },
        { name: 'ISL Sign Videos', pct: isl, color: '#f59e0b' },
    ]
    const first = sessions[0]
    const compare = {
        title: first.title,
        original: first.sourceFile ? `Uploaded source: ${first.sourceFile}` : 'Original text will appear after OCR/transcription is connected.',
        simplified: first.notes || 'No simplified notes yet.',
        level: first.settings?.explanationLevel || '—',
    }
    const reviewQueue = sessions
        .filter((s) => s.materials?.islVideo && !s.islVideoUrl)
        .map((s) => ({ title: `${s.title} — ISL`, note: 'Awaiting ISL media generation' }))
    return { summary, evaluations, missingTerms, coverageBreakdown, compare, reviewQueue }
}

export function buildTodaysPlan(session) {
    if (!session) return []
    const topic = session.title
    return [
        { id: 1, title: 'Watch ISL Video', topic: `${topic} — ISL`, duration: '10 min', active: !session.islVideoUrl },
        { id: 2, title: 'Read Simplified Notes', topic, duration: '15 min', active: !!session.notes && session.progress < 40 },
        { id: 3, title: 'Attempt Quiz', topic: `${topic} — Practice`, duration: '10 min', active: session.progress >= 40 && session.progress < 80 },
        { id: 4, title: 'Review on YouTube', topic, duration: '10 min', active: session.progress >= 80 && session.progress < 100 },
    ]
}
