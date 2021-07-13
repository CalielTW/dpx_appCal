import {
  GET_LEADS,
  GET_LEAD,
  SET_ERROR,
  CLEAR_CURRENT_LEAD,
  CLEAR_STATE,
  SET_LOADING,
  UPDATE_LEAD,
  CREATE_LEAD
} from "../types";
import _ from "lodash";

export default (state, action) => {
  switch (action.type) {
    case CLEAR_CURRENT_LEAD: 
    return {
      ...state,
      lead: {},
      loading: false,
      error: null
    }
    case CREATE_LEAD:
      return {
        ...state,
        leads: [...state.leads, action.payload],
        loading: false,
        error: null
      };
    case GET_LEADS:
      return {
        ...state,
        leadsSize: action.payload.length,
        leads: [...state.leads, ...action.payload],
        loading: false,
        error: null,
      };
    case UPDATE_LEAD:
      return {
        ...state,
        lead: action.payload,
        loading: false,
        error: null
      };

    case GET_LEAD:
      let sortedActivities = action.payload.activities;
      sortedActivities = _.orderBy(sortedActivities, ['createdAt'],['desc']);
      action.payload.activities = sortedActivities;
      
      let sortedComments = action.payload.comments;
      sortedComments = _.orderBy(sortedComments, ['createdAt'],['desc']);
      action.payload.comments = sortedComments;

      let sortedRecordings = action.payload.recordings;
      sortedRecordings = _.orderBy(sortedRecordings, ['createdAt'],['desc']);
      action.payload.recordings = sortedRecordings;
      return {
        ...state,
        lead: action.payload,
        loading: false,
        error: null
      };

    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CLEAR_STATE:
      return {
        lead: {},
        leads: [],
        chart: [],
        loading: false,
        error: null,
      };
    case SET_LOADING:
      return {
        ...state,
        loading: true,
      };

    default:
      return state;
  }
};
