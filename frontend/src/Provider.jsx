import React from 'react';
import AuthProvider from './components/AuthProvider';

export const Provider = () => {
  const { user } = AuthProvider.useAuth();

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Provider Dashboard</h1>
          
          {user && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Welcome, {user.name || user.email}</h5>
                <p className="card-text">Role: {user.role}</p>
                
                <div className="row mt-4">
                  <div className="col-md-6">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6 className="card-title">Patient Management</h6>
                        <p className="card-text">Manage your patients and their health records</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h6 className="card-title">Appointments</h6>
                        <p className="card-text">View and manage upcoming appointments</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row mt-3">
                  <div className="col-md-6">
                    <div className="card bg-info text-white">
                      <div className="card-body">
                        <h6 className="card-title">Health Resources</h6>
                        <p className="card-text">Access medical guidelines and resources</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card bg-warning text-white">
                      <div className="card-body">
                        <h6 className="card-title">Reports</h6>
                        <p className="card-text">Generate patient and practice reports</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 