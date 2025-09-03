import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationStore } from '../../stores/navigationStore';
import { useConversationStore } from '../../stores/conversationStore';
import { useAssessmentQuestions } from '../../hooks/assessment/useAssessmentQuestions';
import { NavigationItem, NavigationItemNested, NavigationSection } from '../common';
