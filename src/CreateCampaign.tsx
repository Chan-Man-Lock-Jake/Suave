import React from 'react';
import { Link } from 'react-router-dom';
import './css/CreateCampaign.css';

const CreateCampaign: React.FC = () => {
  return (
    <div className="create-campaign-page">
      <nav className="navbar">
        <button className="logout-button">Log Out</button>
      </nav>

      <main className="main-content">
        <div className="campaign-card">
          <Link to="/new-campaign-form">
            <p className="campaign-text">Create Campaign</p>
          </Link>
        </div>

        <div className="campaign-card">
          <Link to="/existing-campaigns">
            <p className="campaign-text">Existing Campaigns</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CreateCampaign;
