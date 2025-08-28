import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';

const Appointment = () => {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
    date: '',
    doctor: '',
  });

  useEffect(() => {
    AOS.init();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="our-appointment bg-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 order-lg-1 order-2">
            <div className="our-appointment-image">
              <figure>
                <img src="/images/appointment-image.png" alt="Appointment image" />
              </figure>
            </div>
          </div>
          <div className="col-lg-6 order-lg-2 order-1">
            <div className="appointment-form">
              <div className="section-title">
                <h3 className="wow fadeInUp">Appointment</h3>
                <h2 className="text-anime-style-3" data-cursor="-opaque">Schedule your consultation today!</h2>
              </div>
              <form id="appointmentForm" onSubmit={handleSubmit} className="wow fadeInUp" data-wow-delay="0.2s">
                <div className="row">
                  <div className="form-group col-md-6 mb-4">
                    <input
                      type="text"
                      name="fname"
                      className="form-control"
                      placeholder="First Name"
                      value={formData.fname}
                      onChange={handleChange}
                      required
                    />
                    <div className="help-block with-errors"></div>
                  </div>
                  <div className="form-group col-md-6 mb-4">
                    <input
                      type="text"
                      name="lname"
                      className="form-control"
                      placeholder="Last Name"
                      value={formData.lname}
                      onChange={handleChange}
                      required
                    />
                    <div className="help-block with-errors"></div>
                  </div>
                  <div className="form-group col-md-6 mb-4">
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <div className="help-block with-errors"></div>
                  </div>
                  <div className="form-group col-md-6 mb-4">
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                    <div className="help-block with-errors"></div>
                  </div>
                  <div className="form-group col-md-6 mb-4">
                    <input
                      type="date"
                      name="date"
                      className="form-control"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                    <div className="help-block with-errors"></div>
                  </div>
                  <div className="form-group col-md-6 mb-4">
                    <select
                      name="doctor"
                      className="form-control form-select"
                      value={formData.doctor}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Choose Doctor</option>
                      <option value="beginner_yoga_classes">Dr. Neha Verma</option>
                      <option value="stress_relief_sessions">Cameron Williamson</option>
                      <option value="mindful_meditation">Dr. Ayesha Kapoor</option>
                      <option value="relaxation_techniques">Dr. Karan Gohel</option>
                      <option value="group_yoga_workshops">Dr. Aryan Malhotra</option>
                      <option value="restorative_yoga">Dr. Aisha Kapoor</option>
                      <option value="mental_clarity_meditation">Dr. Rahul Mehta</option>
                      <option value="personalized_yoga_sessions">Dr. Emily Verma</option>
                    </select>
                    <div className="help-block with-errors"></div>
                  </div>
                  <div className="col-lg-12">
                    <div className="contact-form-btn">
                      <button type="submit" className="btn-default">Get Appointment</button>
                      <div id="msgSubmit" className="h3 hidden"></div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;