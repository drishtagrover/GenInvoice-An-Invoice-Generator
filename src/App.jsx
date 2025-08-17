import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css'
import MenuBar from './components/Menubar.jsx';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MainPage from './pages/MainPage.jsx';
import PreviewPage from './pages/PreviewPage.jsx';
import UserSyncHandler from './components/UserSyncHandler.jsx';
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';

function App() {
 

  return (
    <BrowserRouter>
    <UserSyncHandler />
    <MenuBar />
    <Toaster />
      <Routes>
        <Route path='/' element={<LandingPage />} />

        <Route path='/dashboard' element={
          <>
            <SignedIn>
              <Dashboard />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        } />
        <Route path='/generate' element={
          <>
          <SignedIn>
            <MainPage />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          </>
        } />
        <Route path='/preview' element={
          <>
          <SignedIn>
            <PreviewPage />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App
