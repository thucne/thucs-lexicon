import { SearchResults, SearchResultsSupabase } from '@/types';
import { Dispatch } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { setSearchResults } from '../reducers/searchResults';
import { setFavoriteLexicons, toggleFavoriteLexicon } from '../reducers/favoriteLexicons';
import { requestLogin } from '../reducers/auth';

type ReturnType = (dispatch: Dispatch) => Promise<void>;

const PERSIST_URL = '/api/supabase/lexicon/persist';
const FAVORITE_URL = '/api/supabase/lexicon/add-to-favorite';
const GET_FAVORITES_URL = '/api/supabase/lexicon/get-favorite-lexicons';
const LOG_PREFIX = '[Persist]';

function persistWordToDatabaseAndStore(word: string, searchResults: SearchResults): ReturnType;
function persistWordToDatabaseAndStore(words: SearchResultsSupabase[]): ReturnType;
function persistWordToDatabaseAndStore(arg1: unknown, arg2?: unknown): ReturnType {
    try {
        if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
                throw new Error('No words to persist');
            }
            return async (_: Dispatch) => {
                return await axios.post(PERSIST_URL, arg1).then((_) => {
                    console.log(`${LOG_PREFIX} Persisted!`);
                });
            };
        }

        if (typeof arg1 === 'string' && Array.isArray(arg2)) {
            return async (dispatch: Dispatch) => {
                return await axios
                    .post(PERSIST_URL, {
                        word: arg1,
                        searchResults: arg2
                    })
                    .then((_) => {
                        console.log(`${LOG_PREFIX} Persisted!`);
                        dispatch(setSearchResults({ word: arg1 as string, results: arg2 as SearchResults }));
                    });
            };
        }

        return async (_: Dispatch) => {
            console.log(`${LOG_PREFIX} Skipping...`);
        };
    } catch (error) {
        return async (_: Dispatch) => {};
    }
}

function toggleAndPersistFavoriteLexicon(word: string): ReturnType {
    return async (dispatch: Dispatch) => {
        return await axios
            .post(FAVORITE_URL, { word }, { withCredentials: true })
            .then((response) => {
                // if unauthorized, request login
                if (response.status === 401) {
                    dispatch(requestLogin({ callbackUrl: `/search/${word}?favorite=toggle` }));
                } else {
                    dispatch(toggleFavoriteLexicon({ word, state: response.data.currentState }));
                }
            })
            .catch((error: AxiosError) => {
                if (error.response?.status === 401) {
                    dispatch(requestLogin({ callbackUrl: `/search/${word}?favorite=toggle` }));
                }
            });
    };
}

function getFavorites(): ReturnType {
    return async (dispatch: Dispatch) => {
        return await axios
            .get(GET_FAVORITES_URL, { withCredentials: true })
            .then((response) => {
                dispatch(setFavoriteLexicons(response.data?.map((r: { lexicon: string }) => r.lexicon) ?? []));
            })
            .catch((_: AxiosError) => {});
    };
}

export { persistWordToDatabaseAndStore, toggleAndPersistFavoriteLexicon, getFavorites };
