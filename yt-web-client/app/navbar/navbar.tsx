'use client';
import React, { useEffect, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import {NavbarBrand} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import SignInSignOut from '../signinout/signinout';
import { User } from "firebase/auth"
import { onAuthStateChangedHelper } from "../firebase/firebase";

export default function NavBar() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChangedHelper((user) => {
            setUser(user);
        });
        return () => unsubscribe();
    })

    return (
        <Navbar className="bg-body-tertiary">
            <Container>
                <NavbarBrand >
                    <img
                        alt=""
                        src="/youtube-logo.svg"
                        width="90"
                        height="30"
                        className="d-inline-block align-top"
                    />{' '}
                    
                </NavbarBrand>
                <SignInSignOut user={user}/>
            </Container>
        </Navbar>

    )
}