'use client';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { TextField } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { createUrl } from '@/utils';

const BootstrapInput = styled(TextField)(({ theme }) => ({
    width: '100%',
    'label + &': {
        marginTop: theme.spacing(3)
    },
    '& .MuiInputBase-input': {
        borderRadius: 4,
        position: 'relative',
        backgroundColor: theme.palette.mode === 'light' ? '#F3F6F9' : '#1A2027',
        border: '1px solid',
        borderColor: theme.palette.mode === 'light' ? '#E0E3E7' : '#2D3843',
        fontSize: 16,
        width: '100%',
        padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
        // Use the system font instead of the default Roboto font.
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"'
        ].join(','),
        '&:focus': {
            boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
            borderColor: theme.palette.primary.main
        }
    }
}));

const SearchBar = () => {
    const searchRef = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    /**
     * >>> This is an example of destructuring assignment,
     *    it allows you to unpack values from arrays, or properties from objects, into distinct variables.
     *    in this case, useState returns
     */
    const [search, setSearch] = useState('');

    const searchFromUrl = searchParams.get('q');

    useEffect(() => {
        setSearch(searchFromUrl || '');
    }, [searchFromUrl]);

    useEffect(() => {
        searchRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        /**
         * >>> This is an example of type assertion, it tells the compiler that the value is of a specific type.
         *     However, we need to be careful when using type assertions, as it can lead to runtime errors if the type assertion is incorrect.
         *          In this case, we are asserting that e.target is an HTMLFormElement.
         *                              and e.target.search is an HTMLInputElement.
         */
        // const val = e.target as HTMLFormElement;
        // const search = val.search as HTMLInputElement;
        // const searchValue = search.value;

        const newParams = new URLSearchParams(searchParams.toString());

        /**
         * >>> This is an example of variable lookup, JS will look for a variable named `search` in the current scope,
         *      this then will look for a variable named `search` in the parent scope, and so on until it reaches the global scope.
         *      In this case, the variable `search` is declared in the parent scope, so it will be used.
         *          Line 52
         */
        if (search) {
            newParams.set('q', search);
        } else {
            newParams.delete('q');
        }

        router.push(createUrl('/search', newParams));
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <BootstrapInput
                id="search-input"
                name="search"
                placeholder="Hallucinate"
                value={search}
                /**
                 * >>> Functions are treated as first-class citizens in JavaScript,
                 *      they can be passed around as arguments to other functions
                 * 
                 * >>> slice is a method that returns a shallow copy of a portion of an array
                 *       slice doesn't mutate the original array, it returns a new array
                 *          in this case, string is an array of characters
                 */
                onChange={(e) => setSearch(e.target.value.slice(0, 100))}
                inputRef={searchRef}
            />
        </form>
    );
};

export default SearchBar;