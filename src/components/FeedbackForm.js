import React, { useState, useEffect } from "react";
import "../../src/App.css";

const translations = {
    mr: {
      title: "अहिल्यानगर पोलीस",
      thankYou: "धन्यवाद!",
      campaignClosed: "अभिप्राय मोहीम संपली",
      thankYouMessage: "आपल्या मौल्यवान अभिप्रायासाठी मनःपूर्वक धन्यवाद!",
      detailMessage:
        "आम्ही आपल्या सर्व अभिप्रायांचा अभ्यास करून पोलीस सेवेत सुधारणा करण्यासाठी कार्य करत आहोत.आपल्या सहकार्याने आम्हाला चांगली सेवा देण्यास मदत होते.",
      quote:
        "आपल्या अभिप्रायामुळे आम्ही आणखी चांगली सेवा देऊ शकतो. जनतेची सेवा करणे हे आमचे सर्वोच्च ध्येय आहे.",
      publicCooperation: "जनसहकार्य",
      withYourHelp: "आपल्या मदतीने",
      serviceImprovement: "सेवा सुधारणा",
      continuousProgress: "निरंतर प्रक्रिया",
      security: "सुरक्षा",
      ourResponsibility: "आमची जबाबदारी",
      needMoreHelp: "आणखी काही मदत हवी असल्यास:",
      emergency: "लँडलाइन क्रमांक:",
      email: "ईमेल:",
      finalThanks: "🙏 पुन्हा एकदा धन्यवाद! 🙏",
      department: "- अहिल्यानगर पोलीस विभाग",
      copyright: "अहिल्यानगर पोलीस",
    },
    en: {
      title: "AHILYANAGAR POLICE",
      thankYou: "Thank You!",
      campaignClosed: "Feedback Campaign Closed",
      thankYouMessage: "Heartfelt thanks for your valuable feedback!",
      detailMessage:
        "We are studying all your feedback and working to improve police services. Your cooperation helps us provide better service.",
      quote:
        "Your feedback helps us provide even better service. Serving the public is our highest goal.",
      publicCooperation: "Public Cooperation",
      withYourHelp: "With Your Help",
      serviceImprovement: "Service Improvement",
      continuousProgress: "Continuous Process",
      security: "Security",
      ourResponsibility: "Our Responsibility",
      needMoreHelp: "If you need any further assistance:",
      emergency: "Landline No",
      email: "Email:",
      finalThanks: "🙏 Thank You Once Again! 🙏",
      department: "- Ahilyanagar Police Department",
      copyright: "Ahilyanagar Police",
    },
  };

const FeedbackForm = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [language, setLanguage] = useState("mr"); // Added missing state

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
 const t = translations[language];

  return (
       <div className="container-fluid px-0">
      {/* Enhanced Header with Gradient and Subtle Animation */}
      <header
        className="sticky-top"
        style={{
          background: "linear-gradient(135deg, #0A2362 0%, #1a4a9a 100%)",
          boxShadow: "0 4px 20px rgba(10, 35, 98, 0.3)",
          borderBottom: "3px solid #FFD700",
          zIndex: 1000,
        }}
      >
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-center py-2 py-md-3">
            {/* Logo - Left aligned */}
            <div
              className="d-flex align-items-center order-1 order-md-1"
              style={{ flex: "0 0 auto" }}
            >
              <div
                className="logo-container"
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  transition: "all 0.3s ease",
                  background: "rgba(255,255,255,0.9)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-3px) rotateY(10deg)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px rgba(0,0,0,0.1)";
                }}
              >
                <img
                  src="/favicon.ico"
                  alt="Maharashtra Government Logo"
                  style={{
                    height: windowWidth < 768 ? "40px" : "80px",
                    width: "auto",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                    transition: "transform 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Centered Title - Middle */}
            <div
              className="order-2 order-md-2 text-center mx-2 mx-md-4"
              style={{
                flex: "1 1 auto",
                minWidth: 0,
                overflow: "visible",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "auto",
                minHeight: language === "mr" ? "50px" : "auto",
                padding: windowWidth < 768 ? "8px 0" : "10px 0",
              }}
            >
              <h2
                className="fw-bold mb-0 text-white"
                style={{
                  fontSize:
                    windowWidth < 420
                      ? language === "mr"
                        ? "1rem"
                        : "1rem"
                      : windowWidth < 768
                      ? language === "mr"
                        ? "1.1rem"
                        : "1.1rem"
                      : windowWidth < 992
                      ? "1.4rem"
                      : "1.7rem",
                  letterSpacing: "0.5px",
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
                  maxWidth: "100%",
                  whiteSpace: "nowrap",
                  overflow: "visible",
                  textOverflow: "ellipsis",
                  lineHeight: language === "mr" ? "1.5" : "1.2",
                  margin: 0,
                  padding: language === "mr" ? "5px 5px" : "0 5px",
                  height: "100%",
                }}
              >
                {t.title}
                <span
                  style={{
                    position: "absolute",
                    bottom: "-3px",
                    left: 0,
                    width: "100%",
                    height: "2px",
                    background: "linear-gradient(to right, #FFD700, #FFFFFF)",
                    borderRadius: "3px",
                    transform: "scaleX(0)",
                    transformOrigin: "left center",
                  }}
                ></span>
              </h2>
            </div>

            {/* Language Selector - Right aligned */}
            <div
              className="order-3 order-md-3 mt-0 ms-auto ms-md-0"
              style={{
                flex: "0 0 auto",
                width:
                  windowWidth < 420
                    ? "100px"
                    : windowWidth < 768
                    ? "110px"
                    : "120px",
                marginLeft: windowWidth < 768 ? "auto" : "0",
                marginRight:
                  windowWidth < 420 ? "5px" : windowWidth < 768 ? "10px" : "0",
              }}
            >
              <div
                className="position-relative"
                style={{
                  width: "100%",
                }}
              >
                <select
                  className="form-select ps-3 pe-4 py-1"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    border: "2px solid rgba(255,255,255,0.3)",
                    color: "#0A2362",
                    fontWeight: "600",
                    cursor: "pointer",
                    borderRadius: "30px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(4px)",
                    appearance: "none",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    backgroundImage: `url(${
                      language === "mr" ? "/india-flag.png" : "/uk-flag.png"
                    }), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%230A2362' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat, no-repeat",
                    backgroundPosition: `
                ${windowWidth < 768 ? "8px" : "10px"} center,
                calc(100% - ${windowWidth < 768 ? "10px" : "15px"}) center
              `,
                    backgroundSize: "16px, 16px",
                    paddingRight:
                      windowWidth < 420
                        ? "25px"
                        : windowWidth < 768
                        ? "30px"
                        : "35px",
                    paddingLeft:
                      windowWidth < 420
                        ? "25px"
                        : windowWidth < 768
                        ? "30px"
                        : "35px",
                    width: "100%",
                    fontSize:
                      windowWidth < 420
                        ? "12px"
                        : windowWidth < 768
                        ? "14px"
                        : "16px",
                  }}
                >
                  <option value="mr">मराठी</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="py-4 py-md-5"
        style={{
          background:
            "linear-gradient(to bottom, rgba(240, 244, 255, 0.8), rgba(255, 255, 255, 1))",
          minHeight: "calc(100vh - 150px)",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-8">
              {/* Thank You Card */}
              <div
                className="card border-0 shadow overflow-hidden text-center"
                style={{
                  borderRadius: windowWidth < 768 ? "12px" : "20px",
                  borderTop: "5px solid #0A2362",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Success Icon */}
                <div className="card-body p-4 p-md-5 p-lg-6">
                  <div
                    className="mb-4 mb-md-5"
                    style={{
                      animation: "bounceIn 1s ease-out",
                    }}
                  ></div>

                  {/* Main Thank You Message */}
                  <h1
                    className="display-4 fw-bold mb-3 mb-md-4"
                    style={{
                      color: "#0A2362",
                      fontSize: windowWidth < 768 ? "2rem" : "3rem",
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      animation: "fadeInUp 1s ease-out 0.3s both",
                    }}
                  >
                    {t.thankYou}
                  </h1>

                  {/* Campaign Closure Message */}
                  <div
                    className="mb-4 mb-md-5"
                    style={{
                      animation: "fadeInUp 1s ease-out 0.6s both",
                    }}
                  >
                    <div
                      className="alert alert-info border-0 mb-4"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(10, 35, 98, 0.1), rgba(26, 74, 154, 0.1))",
                        borderLeft: "4px solid #0A2362",
                        borderRadius: "10px",
                        fontSize: windowWidth < 768 ? "1rem" : "1.1rem",
                        lineHeight: "1.6",
                      }}
                    >
                      <i
                        className="fas fa-info-circle me-2"
                        style={{ color: "#0A2362" }}
                      ></i>
                      <strong>{t.campaignClosed}</strong>
                    </div>

                    <p
                      className="lead mb-4"
                      style={{
                        color: "#0A2362",
                        fontSize: windowWidth < 768 ? "1.1rem" : "1.3rem",
                        lineHeight: "1.6",
                        fontWeight: "500",
                      }}
                    >
                      {t.thankYouMessage}
                    </p>

                    <p
                      className="mb-4"
                      style={{
                        color: "#495057",
                        fontSize: windowWidth < 768 ? "1rem" : "1.1rem",
                        lineHeight: "1.7",
                      }}
                    >
                      {t.detailMessage}
                    </p>

                    <div
                      className="quote-section p-3 p-md-4 mb-4"
                      style={{
                        background: "rgba(255, 215, 0, 0.1)",
                        borderLeft: "4px solid #FFD700",
                        borderRadius: "8px",
                        fontStyle: "italic",
                      }}
                    >
                      <p
                        className="mb-0"
                        style={{
                          color: "#0A2362",
                          fontSize: windowWidth < 768 ? "0.95rem" : "1.05rem",
                          lineHeight: "1.6",
                          fontWeight: "500",
                        }}
                      >
                        "{t.quote}"
                      </p>
                    </div>
                  </div>

                  {/* Statistics or Achievement Section */}
                  <div
                    className="row g-3 mb-4 mb-md-5"
                    style={{
                      animation: "fadeInUp 1s ease-out 0.9s both",
                    }}
                  >
                    <div className="col-12 col-md-4">
                      <div
                        className="stat-card p-3 p-md-4"
                        style={{
                          background:
                            "linear-gradient(135deg, #0A2362, #1a4a9a)",
                          borderRadius: "12px",
                          color: "white",
                          textAlign: "center",
                          boxShadow: "0 4px 15px rgba(10, 35, 98, 0.2)",
                        }}
                      >
                        <i className="fas fa-users fa-2x mb-2"></i>
                        <h6 className="fw-bold mb-1">{t.publicCooperation}</h6>
                        <small>{t.withYourHelp}</small>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div
                        className="stat-card p-3 p-md-4"
                        style={{
                          background:
                            "linear-gradient(135deg, #28a745, #20c997)",
                          borderRadius: "12px",
                          color: "white",
                          textAlign: "center",
                          boxShadow: "0 4px 15px rgba(40, 167, 69, 0.2)",
                        }}
                      >
                        <i className="fas fa-chart-line fa-2x mb-2"></i>
                        <h6 className="fw-bold mb-1">{t.serviceImprovement}</h6>
                        <small>{t.continuousProgress}</small>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div
                        className="stat-card p-3 p-md-4"
                        style={{
                          background:
                            "linear-gradient(135deg, #ffc107, #fd7e14)",
                          borderRadius: "12px",
                          color: "white",
                          textAlign: "center",
                          boxShadow: "0 4px 15px rgba(255, 193, 7, 0.2)",
                        }}
                      >
                        <i className="fas fa-shield-alt fa-2x mb-2"></i>
                        <h6 className="fw-bold mb-1">{t.security}</h6>
                        <small>{t.ourResponsibility}</small>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div
                    className="contact-info p-3 p-md-4"
                    style={{
                      background: "rgba(10, 35, 98, 0.05)",
                      borderRadius: "12px",
                      border: "1px solid rgba(10, 35, 98, 0.1)",
                      animation: "fadeInUp 1s ease-out 1.2s both",
                    }}
                  >
                    <h6
                      className="fw-bold mb-3 text-center"
                      style={{ color: "#0A2362" }}
                    >
                      {t.needMoreHelp}
                    </h6>

                   <div className="row g-3 justify-content-center">
  <div className="col-12 col-md-6">
    <div
      className="d-flex align-items-center justify-content-center p-3 text-center"
      style={{
        background: "rgba(10, 35, 98, 0.1)",
        borderRadius: "8px",
        border: "1px solid rgba(10, 35, 98, 0.2)",
        minHeight: "70px",
      }}
    >
      <div className="w-100">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="#0A2362"
          width="16px"
          height="16px"
          className="mb-2 d-block mx-auto"
        >
          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
        </svg>
        <strong
          className="d-block mb-1"
          style={{ color: "#0A2362" }}
        >
          {t.emergency}
        </strong>
        <span
          className="d-block"
          style={{ color: "#495057", fontSize: "0.9rem" }}
        >
          02564-210113
        </span>
      </div>
    </div>
  </div>

  <div className="col-12 col-md-6">
    <div
      className="d-flex align-items-center justify-content-center p-3 text-center"
      style={{
        background: "rgba(10, 35, 98, 0.1)",
        borderRadius: "8px",
        border: "1px solid rgba(10, 35, 98, 0.2)",
        minHeight: "70px",
      }}
    >
      <div className="w-100">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="#0A2362"
          width="16px"
          height="16px"
          className="mb-2 d-block mx-auto"
        >
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
        <strong
          className="d-block mb-1"
          style={{ color: "#0A2362" }}
        >
          {t.email}
        </strong>
        <span
          className="d-block"
          style={{
            color: "#495057",
            fontSize: "0.85rem",
            wordBreak: "break-word",
          }}
        >
          sp.Ahilyanagar@mahapolice.gov.in
        </span>
      </div>
    </div>
  </div>
</div>
                  </div>
                  {/* Final Message */}
                  <div
                    className="final-message mt-4 mt-md-5"
                    style={{
                      animation: "fadeInUp 1s ease-out 1.5s both",
                    }}
                  >
                    <p
                      className="fw-bold mb-0"
                      style={{
                        color: "#0A2362",
                        fontSize: windowWidth < 768 ? "1rem" : "1.1rem",
                      }}
                    >
                      {t.finalThanks}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-3 py-md-4 mt-4 mt-md-5"
        style={{
          background: "linear-gradient(135deg, #0A2362 0%, #1a4a9a 100%)",
          color: "white",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <p
                className="mb-0"
                style={{ fontSize: windowWidth < 768 ? "0.85rem" : "1rem" }}
              >
                <i className="fas fa-copyright me-2"></i>
                {new Date().getFullYear()} {t.copyright}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
          }
          50% {
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.5);
          }
          100% {
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
          }
        }

        .stat-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2) !important;
        }

        .contact-info {
          transition: all 0.3s ease;
        }

        .contact-info:hover {
          background: rgba(10, 35, 98, 0.08) !important;
          border-color: rgba(10, 35, 98, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default FeedbackForm;