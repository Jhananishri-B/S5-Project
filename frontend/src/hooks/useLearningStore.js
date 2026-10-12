import { useEffect, useState, useCallback } from 'react'
import {
    getLearningState,
    subscribeLearningStore,
    toggleBookmark as toggleBookmarkStore,
    isBookmarked as isBookmarkedStore,
} from '../services/learningStore'

export function useLearningStore() {
    const [state, setState] = useState(getLearningState)

    useEffect(() => subscribeLearningStore(setState), [])

    const refresh = useCallback(() => setState(getLearningState()), [])

    const toggleBookmark = useCallback((sessionId) => {
        toggleBookmarkStore(sessionId)
        refresh()
    }, [refresh])

    const isBookmarked = useCallback((sessionId) => isBookmarkedStore(sessionId), [state])

    return {
        ...state,
        refresh,
        toggleBookmark,
        isBookmarked,
        islBookmarks: state.islBookmarks || [],
        islRequests: state.islRequests || [],
    }
}
