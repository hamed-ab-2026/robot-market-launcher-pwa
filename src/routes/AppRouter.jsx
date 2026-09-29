import React, {lazy, Suspense, useState, useEffect} from "react";
import {Routes, Route, Navigate, useLocation} from "react-router-dom";
import {useSelector} from "react-redux";

const SplashScreen = lazy(() => import("../pages/SplashScreen"));
const AuthPage = lazy(() => import("../pages/AuthPage"));
const MainHub = lazy(() => import("../pages/MainHub"));


const SPLASH_DURATION_MS = 5000;


function RequireUnlock({children}) {
    const isUnlocked = useSelector((state) => state.auth.isUnlocked);
    const location = useLocation();

    if (!isUnlocked) {
        return <Navigate to="/auth" replace state={{from: location}}/>;
    }
    return children;
}


export default function AppRouter() {
    const [splashDone, setSplashDone] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setSplashDone(true), SPLASH_DURATION_MS);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Suspense fallback={<div className="min-h-screen bg-surface-light dark:bg-surface-dark"/>}>
            {!splashDone ? <SplashScreen/> : <Routes>

            <Route path="/auth" element={<AuthPage/>}/>

            <Route
                path="/hub"
                element={
                    <RequireUnlock>
                        <MainHub/>
                    </RequireUnlock>
                }/>

            <Route
                path="/"
                element={
                    <RequireUnlock>
                        <Navigate to="/hub" replace/>
                    </RequireUnlock>
                }/>

            <Route path="*" element={<Navigate to="/" replace/>}/>

            </Routes>}
        </Suspense>
    );

}
