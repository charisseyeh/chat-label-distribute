import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationStore } from '../../stores/navigationStore';
import { performanceMonitor } from '../../utils/performance';

export const useNavigationSync = () => {
  const location = useLocation();
  const { batchUpdate } = useNavigationStore();
  const previousPathRef = useRef<string | null>(null);

  // Memoize the navigation logic to prevent unnecessary recalculations
  const navigationConfig = useMemo(() => {
    const path = location.pathname;
    
    if (path === '/' || path === '/select-conversations') {
      return { page: 'select-conversations' as const, conversationId: null, templateId: undefined };
    } else if (path === '/label-conversations') {
      return { page: 'label-conversations' as const, conversationId: null, templateId: undefined };
    } else if (path === '/ai-comparisons') {
      return { page: 'ai-comparisons' as const, conversationId: null, templateId: undefined };
    } else if (path === '/assessment-templates') {
      return { page: 'assessment-templates' as const, conversationId: null, templateId: undefined };
    } else if (path.startsWith('/conversation/')) {
      const conversationId = path.split('/conversation/')[1];
      return { page: 'label-conversations' as const, conversationId, templateId: undefined };
    } else if (path.startsWith('/assessment-template/')) {
      const templateId = path.split('/assessment-template/')[1];
      return { page: 'assessment-questions' as const, conversationId: null, templateId };
    }
    
    return { page: 'select-conversations' as const, conversationId: null, templateId: undefined };
  }, [location.pathname]);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;
    
    // Only update if the path actually changed
    if (previousPath === currentPath) {
      return;
    }
    
    previousPathRef.current = currentPath;
    
    const { page, conversationId, templateId } = navigationConfig;
    
    // Track navigation performance only when path changes
    performanceMonitor.startNavigation(currentPath);
    
    // Use batch update for better performance - single state update instead of three
    const updates: any = {
      currentPage: page,
      currentConversationId: conversationId,
      currentTemplateId: templateId !== undefined ? templateId : null
    };
    
    batchUpdate(updates);
    
    // Mark navigation as complete after state update
    requestAnimationFrame(() => {
      performanceMonitor.endNavigation(currentPath);
    });
  }, [navigationConfig, batchUpdate]);
};
