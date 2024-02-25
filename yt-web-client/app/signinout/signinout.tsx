'use client';

import React, { Fragment } from "react";
import Button from 'react-bootstrap/Button';
import { signInWithGoogle, signOut } from '../firebase/firebase';
import { User } from 'firebase/auth';

interface SignInProps {
    user: User | null;
}

export default function SignInSignOut({ user }: SignInProps) {
    return (
        <Fragment>
            {
                user ?
                    (<Button as="input" type="button" value="Sign Out" onClick={signOut} />)
            :
            (<Button as="input" type="button" value="Sign In" onClick={signInWithGoogle} />)
            }


        </Fragment>
    )
}