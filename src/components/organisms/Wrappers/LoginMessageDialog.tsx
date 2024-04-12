'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';

import { Dialog, DialogActions, DialogContent, DialogTitle, Typography, Button, Box } from '@mui/material';
import {
    cancelLoginRequest,
    resetLogin,
    selectAuthUrl,
    selectCallbackUrl,
    selectShowLoginDialog
} from '@/redux/reducers/auth';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const constructLoginUrl = (callbackUrl: string) => {
    return `/api/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
};

declare const google: any;

const LoginMessageDialog = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const url = useAppSelector(selectAuthUrl);
    const callbackUrl = useAppSelector(selectCallbackUrl);
    const showLoginDialog = useAppSelector(selectShowLoginDialog);
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        let tryAgain: ReturnType<typeof setInterval>;

        if (google) {
            const handleCredentialResponse = async (response: any) => {
                try {
                    const { credential } = response;

                    setIsLoggingIn(true);

                    await axios.post('/api/auth/login/validate', { token: credential }).then((res) => res.data);

                    console.log(callbackUrl)

                    if (callbackUrl) {
                        router.push(callbackUrl);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoggingIn(false);
                }
            };

            tryAgain = setInterval(() => {
                google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse
                });
                const parent = document.getElementById('google_btn');

                if (parent) {
                    google.accounts.id.renderButton(parent, {
                        theme: 'filled_black',
                        text: 'login_with',
                        shape: 'pill',
                        logo_alignment: 'left',
                        width: '240'
                    });
                    clearInterval(tryAgain);
                }
            }, 250);
        }

        return () => tryAgain && clearInterval(tryAgain);
    }, [showLoginDialog, callbackUrl, router]);

    const handleClose = (success: boolean) => {
        dispatch(resetLogin({ success }));
    };

    return (
        <Dialog open={showLoginDialog} maxWidth="xs" onClose={isLoggingIn ? undefined : () => handleClose(false)}>
            <DialogTitle>To continue, please login with Google!</DialogTitle>
            <DialogContent dividers>
                {!url ? (
                    <Typography>Failed to initiate login. Please try again.</Typography>
                ) : (
                    <Typography>
                        You will be redirected to the login page. Click the button below to proceed.
                    </Typography>
                )}
                <Typography variant="caption" color="warning.main" className="mt-2">
                    If you don&apos;t have any Google account, you may need to create one first.
                </Typography>
                <Box className="mt-3">
                    <div id="google_btn" />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    size="small"
                    onClick={() => dispatch(cancelLoginRequest())}
                    sx={{ textTransform: 'none' }}
                    disabled={isLoggingIn}
                >
                    {isLoggingIn ? 'Logging in...' : 'Cancel'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LoginMessageDialog;