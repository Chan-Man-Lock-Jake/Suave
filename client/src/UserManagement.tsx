import React from 'react';
import Header from './components/Header';
import Hero from './pages/Landing/Hero';
import Features from './Features';
import Footer from './components/Footer';
import './css/Home.css';
import BlankSpace from './components/BlankSpace';

const Home: React.FC = () => {
  return (
    <>
      <Header />
      <main className="main-content mt-5">
        <Hero />
        
      </main>
    </>
  );
};

export default Home;
