import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../src/App.css";

const translations = {
  en: {
    title: "Feedback",
    fullName: "Full Name (optional)",
    phone: "Phone Number (optional)",
    description: "Feedback",
    image: "Upload Image (Optional)",
    overallRating: "Overall Rating (1-10)",
    departmentRating: "Add Department-wise Rating (Optional)",
    submit: "Submit",
    namePlaceholder: "Your Name",
    phonePlaceholder: "Your Phone Number",
    descriptionPlaceholder: "Enter your feedback",
    selectDepartment: "Department",
    add: "Add",
    remove: "Remove",
    success: "Feedback submitted successfully.",
    error:
      "There was an issue submitting your feedback. Please try again later.",
    descriptionNote: "Express your feedback (max 50 words)",
    departmentList: [
      "Traffic",
      "Women Safety",
      "Action against Narcotics",
      "Cyber Crime",
    ],
    departmentRatingsHeading:
      "For department-wise rating, select a department below",
    rating: "Rating",
    alreadyRated: "department has already been rated",
    invalidPhone: "Please enter a valid 10-digit phone number.",
    fileSizeError: "File size must be less than 10MB",
    fileTypeError: "Please select only image files (JPG, PNG, GIF, etc.)",
    descriptionRequired: "Please enter your feedback.",
    slogans: [
      "We believe that <br><span style='padding-left: clamp(30px, 8vw, 150px); display: inline-block; font-weight: bold; font-style: italic; font-size:1em'><b>\"There is always scope for improvement\"</b></span>",
      "We are committed to serve the people <br><span style='padding-left: clamp(60px, 15vw, 330px); display: inline-block; font-weight: bold; font-style: italic; font-size:1em'><b>\"Do you want to say something?\"</b></span>"
    ],
    tableHeaders: {
      department: "Department",
      rating: "Rating",
      value: "Value",
      select: "Select",
    },
  },
  mr: {
    title: "अभिप्राय",
    fullName: "पूर्ण नाव (वैकल्पिक)",
    phone: "फोन नंबर (वैकल्पिक)",
    description: "अभिप्राय",
    image: "छायाचित्र अपलोड करा (पर्यायी)",
    overallRating: "एकूण रेटिंग (1-10)",
    departmentRating: "विभागानुसार रेटिंग (पर्यायी)",
    submit: "पाठवा",
    namePlaceholder: "तुमचं नाव",
    phonePlaceholder: "तुमचा फोन नंबर",
    descriptionPlaceholder: "अभिप्राय नोंदवा",
    selectDepartment: "विभाग",
    add: "जोडा",
    remove: "काढा",
    success: "अभिप्राय यशस्वीरित्या पाठवला गेला",
    error:
      "तुमचा अभिप्राय पाठवण्यात काही अडचण आली आहे. कृपया नंतर पुन्हा प्रयत्न करा.",
    descriptionNote: "आपला अभिप्राय व्यक्त करा (कमाल ५० शब्दांची मर्यादा )",
    departmentList: [
      "वाहतूक",
      "महिला सुरक्षा",
      "अमली पदार्थ विरुद्ध कारवाई",
      "सायबर गुन्हे",
    ],
    departmentRatingsHeading: "विभागानुसार रेटिंग साठी खालील विभाग निवडा",
    rating: "रेटिंग",
    alreadyRated: "विभाग आधीच निवडलेला आहे",
    invalidPhone: "कृपया १० अंकी फोन नंबर टाका.",
    fileSizeError: "फाईलचा आकार १०MB पेक्षा कमी असणे आवश्यक आहे",
    fileTypeError: "कृपया फक्त छायाचित्र फाईल्स निवडा (JPG, PNG, GIF, इ.)",
    descriptionRequired: "कृपया अभिप्राय नोंदवा.",
    slogans: [
      "आम्हाला जाणीव आहे<br><span style='padding-left: clamp(30px, 8vw, 150px); display: inline-block; font-weight: bold; font-style: italic; font-size:1.1em'>\"सुधारणा ही निरंतर प्रक्रिया आहे.\"</span>",
      "जनतेला सेवा देण्यासाठी आम्ही कटिबद्ध आहोत<br><span style='padding-left: clamp(60px, 15vw, 330px); display: inline-block; font-weight: bold; font-style: italic; font-size:1.1em'>\"तुम्हाला काही सुचवायचं आहे का ?\"</span>"
    ],
    tableHeaders: {
      department: "विभाग",
      rating: "रेटिंग",
      value: "मूल्यांकन",
      select: "निवडा",
    },
  },
};

const policeStations = [
  { en: "Akole", mr: "अकोले" },
  { en: "Ashwi", mr: "आश्वी" },
  { en: "Belavandi", mr: "बेलवंडी" },
  { en: "Bhingar Camp", mr: "भिंगार कॅम्प" },
  { en: "Ghargaon", mr: "घारगाव" },
  { en: "Jamkhed", mr: "जामखेड" },
  { en: "Karjat", mr: "कर्जत" },
  { en: "Kharda", mr: "खर्डा" },
  { en: "Kopargaon City", mr: "कोपरगाव शहर" },
  { en: "Kopargaon Rural", mr: "कोपरगाव ग्रामीण" },
  { en: "Kotwali", mr: "कोतवाली" },
  { en: "Loni", mr: "लोणी" },
  { en: "MIDC (A.nagar)", mr: "एम आय डी सी (अ.नगर)" },
  { en: "Mirajgaon", mr: "मिरजगाव" },
  { en: "Nagar Taluka", mr: "नगर तालुका" },
  { en: "Newasa", mr: "नेवासा" },
  { en: "Parner", mr: "पारनेर" },
  { en: "Pathardi", mr: "पाथर्डी" },
  { en: "Rahata", mr: "राहाता" },
  { en: "Rahuri", mr: "राहुरी" },
  { en: "Rajur", mr: "राजूर" },
  { en: "Sangamner City", mr: "संगमनेर शहर" },
  { en: "Sangamner Rural", mr: "संगमनेर ग्रामीण" },
  { en: "Shani Shingnapur", mr: "शनि शिंगणापूर" },
  { en: "Shevgaon", mr: "शेवगाव" },
  { en: "Shirdi", mr: "शिर्डी" },
  { en: "Shrigonda", mr: "श्रीगोंदा" },
  { en: "Shrirampur City", mr: "श्रीरामपूर शहर" },
  { en: "Shrirampur Rural", mr: "श्रीरामपूर ग्रामीण" },
  { en: "Sonai", mr: "सोनई" },
  { en: "Supa", mr: "सुपा" },
  { en: "Tofkhana", mr: "तोफखाना" },
];

const FeedbackForm = () => {
  const [language, setLanguage] = useState("mr");
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    description: "",
    overallRating: 2,
  });
  const [deptRatings, setDeptRatings] = useState(
    t.departmentList.map((dept, i) => ({
      department: dept,
      rating: 5,
      checked: false,
    }))
  );
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPoliceStation, setSelectedPoliceStation] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to update the visual progress bar of range inputs
  const updateRangeProgress = (rangeInput) => {
    if (!rangeInput) return;
    const value = rangeInput.value;
    const max = rangeInput.max || 10;
    const min = rangeInput.min || 1;
    const percentage = ((value - min) / (max - min)) * 100;
    rangeInput.style.backgroundSize = `${percentage}% 100%`;
  };

  // Initialize range inputs and add event listeners
  useEffect(() => {
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach((input) => {
      updateRangeProgress(input);
      input.addEventListener("input", () => updateRangeProgress(input));
      input.addEventListener("change", () => updateRangeProgress(input));
    });
    return () => {
      rangeInputs.forEach((input) => {
        input.removeEventListener("input", () => updateRangeProgress(input));
        input.removeEventListener("change", () => updateRangeProgress(input));
      });
    };
  }, []);

  // Helper to get default deptRatings for a language
  const getDefaultDeptRatings = (lang) =>
    translations[lang].departmentList.map((dept) => ({
      department: dept,
      rating: 5,
      checked: false,
    }));

  // Update deptRatings when language changes
  useEffect(() => {
    setFormData({
      name: "",
      phone: "",
      description: "",
      overallRating: 2,
    });
    setDeptRatings(getDefaultDeptRatings(language));

    // Update range inputs after language change
    setTimeout(() => {
      const rangeInputs = document.querySelectorAll('input[type="range"]');
      rangeInputs.forEach((input) => updateRangeProgress(input));
    }, 0);
  }, [language]);

  useEffect(() => {
    const overallRatingInput = document.querySelector(
      'input[name="overallRating"]'
    );
    if (overallRatingInput) {
      updateRangeProgress(overallRatingInput);
    }
  }, [formData.overallRating]);

  // Update department rating sliders when they change
  useEffect(() => {
    const departmentSliders = document.querySelectorAll(
      ".department-rating-slider"
    );
    departmentSliders.forEach((slider) => updateRangeProgress(slider));
  }, [deptRatings]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (e.target.type === "range") {
      updateRangeProgress(e.target);
    }

    if (name === "phone") {
      const numeric = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, phone: numeric }));
    } else if (name === "description") {
      const words = value.trim().split(/\s+/).filter(Boolean);
      if (words.length <= 50) {
        setFormData((prev) => ({ ...prev, description: value }));
      }
    } else if (name === "policeStation") {
      setSelectedPoliceStation(value);
      return;
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Check if description is empty
    if (!formData.description.trim()) {
      toast.error(t.descriptionRequired, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
      return; // Prevent form submission if description is empty
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      toast.error(t.invalidPhone, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
      return; // Prevent form submission if phone is invalid
    }

    if (!selectedPoliceStation) {
      toast.error("Please select your police station.", {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
      return;
    }

    setIsSubmitting(true);
    const startTime = Date.now();

    try {
      const payload = {
        ...formData,
        departmentRatings: deptRatings
          .filter((d) => d.checked)
          .map((d) => ({
            department: d.department,
            rating: d.rating,
          })),
        policeStation: selectedPoliceStation,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/feedback`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const endTime = Date.now();
      const submissionTime = endTime - startTime;
      console.log(`✅ Feedback submitted in ${submissionTime}ms`);

      toast.success(t.success, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });

      setFormData({
        name: "",
        phone: "",
        description: "",
        overallRating: 2,
      });
      setDeptRatings(getDefaultDeptRatings(language));
      setSelectedPoliceStation("");

      // Reset all range inputs visual state
      setTimeout(() => {
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        rangeInputs.forEach((input) => updateRangeProgress(input));
      }, 0);
    } catch (err) {
      const endTime = Date.now();
      const submissionTime = endTime - startTime;
      console.error(
        `❌ Feedback submission failed after ${submissionTime}ms:`,
        err
      );

      let errorMessage = t.error;

      if (err.response?.status === 413) {
        errorMessage =
          language === "mr"
            ? "फाईल खूप मोठी आहे. कृपया लहान फाईल निवडा."
            : "File is too large. Please select a smaller file.";
      }

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeptSlider = (idx, value) => {
    setDeptRatings((ratings) =>
      ratings.map((r, i) => (i === idx ? { ...r, rating: Number(value) } : r))
    );
  };

  const handleDeptCheck = (idx, checked) => {
    setDeptRatings((ratings) =>
      ratings.map((r, i) => (i === idx ? { ...r, checked } : r))
    );
  };

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
            <div className="d-flex align-items-center order-1 order-md-1" style={{ flex: '0 0 auto' }}>
              <div
                className="logo-container"
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  transition: "all 0.3s ease",
                  background: "rgba(255,255,255,0.9)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                  transformStyle: "preserve-3d",
                  perspective: "1000px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px) rotateY(10deg)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                }}
              >
                <img
                  src="/favicon.ico"
                  alt="Maharashtra Government Logo"
                  style={{
                    height: windowWidth < 768 ? "40px" : "80px",
                    width: "auto",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                    transition: "transform 0.3s ease"
                  }}
                />
              </div>
            </div>

            {/* Centered Title - Middle */}
            <div className="order-2 order-md-2 text-center mx-2 mx-md-4" style={{
              flex: '1 1 auto',
              minWidth: 0, // Prevent overflow
              overflow: 'visible', // Changed to visible to prevent text cutoff
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'auto',
              minHeight: language === "mr" ? '50px' : 'auto',
              padding: windowWidth < 768 ? '8px 0' : '10px 0' // Increased padding
            }}>
              <h2
                className="fw-bold mb-0 text-white"
                style={{
                  fontSize: windowWidth < 420 ? (language === "mr" ? "1rem" : "1rem") : // Extra small screens
                    windowWidth < 768 ? (language === "mr" ? "1.1rem" : "1.1rem") : // Small screens
                      windowWidth < 992 ? "1.4rem" : "1.7rem", // Medium and large screens
                  letterSpacing: "0.5px",
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                  textOverflow: 'ellipsis',
                  lineHeight: language === "mr" ? '1.5' : '1.2',
                  margin: 0,
                  padding: language === "mr" ? '5px 5px' : '0 5px',
                  height: '100%'
                }}
              >
                {language === "mr" ? "अहिल्यानगर पोलीस" : "AHILYANAGAR POLICE"}
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

            {/* Language Selector - Right aligned (top on mobile) */}
            <div className="order-3 order-md-3 mt-0 ms-auto ms-md-0" style={{
              flex: '0 0 auto',
              width: windowWidth < 420 ? '100px' : (windowWidth < 768 ? '110px' : '120px'),
              marginLeft: windowWidth < 768 ? 'auto' : '0',
              marginRight: windowWidth < 420 ? '5px' : (windowWidth < 768 ? '10px' : '0')
            }}>
              <div className="position-relative" style={{
                width: '100%'
              }}>
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
                    backgroundImage: `url(${language === "mr" ? "/india-flag.png" : "/uk-flag.png"}), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%230A2362' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat, no-repeat",
                    backgroundPosition: `
                ${windowWidth < 768 ? "8px" : "10px"} center,
                calc(100% - ${windowWidth < 768 ? "10px" : "15px"}) center
              `,
                    backgroundSize: "16px, 16px",
                    paddingRight: windowWidth < 420 ? "25px" : (windowWidth < 768 ? "30px" : "35px"),
                    paddingLeft: windowWidth < 420 ? "25px" : (windowWidth < 768 ? "30px" : "35px"),
                    width: "100%",
                    fontSize: windowWidth < 420 ? "12px" : (windowWidth < 768 ? "14px" : "16px")
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

      {/* Main Content with Subtle Background Pattern */}
      <main
        className="py-3 py-md-4"
        style={{
          background:
            "linear-gradient(to bottom, rgba(240, 244, 255, 0.8), rgba(255, 255, 255, 1))",
          minHeight: "calc(100vh - 150px)",
        }}
      >
        <div className="container">
          {/* Animated Slogans Carousel */}
          <div className="mb-2 mb-md-3">  {/* Reduced bottom margin */}
            <div className="slogan-carousel" style={{ maxWidth: "1200px", margin: "0 auto" }}>
              {t.slogans &&
                t.slogans.map((s, idx) => (
                  <div
                    key={idx}
                    className="slogan-item"
                    style={{
                      animationDelay: `${idx * 0.2}s`,
                      background: "rgba(255,255,255,0.9)",
                      borderRadius: "6px",
                      boxShadow: "0 2px 8px rgba(10, 35, 98, 0.1)",
                      borderLeft: "3px solid #0A2362",
                      transition: "all 0.3s ease",
                      margin: "0 auto 16px",
                      padding: "clamp(12px, 2vw, 20px)",
                      width: "clamp(300px, 90vw, 800px)",
                      boxSizing: "border-box"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(10, 35, 98, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(10, 35, 98, 0.1)";
                    }}
                  >
                    <div
                      className="slogan-text"
                      style={{
                        color: "#0A2362",
                        fontSize: "clamp(14px, 1.8vw, 18px)",
                        lineHeight: "1.5",
                        textAlign: "left",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "break-word"
                      }}
                      dangerouslySetInnerHTML={{ __html: s }}
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Form Section with Floating Label Effect */}
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-8">
              <div
                className="card border-0 shadow overflow-hidden"
                style={{
                  borderRadius: windowWidth < 768 ? "12px" : "15px",
                  borderTop: "5px solid #0A2362",
                }}
              >
                <div
                  className="card-header py-2 py-md-3"
                  style={{
                    background: "linear-gradient(to right, #0A2362, #1a4a9a)",
                    color: "white",
                  }}
                >
                  <h1 className="h4 h-md-3 mb-0 text-center fw-bold">
                    <i className="fas fa-comment-alt me-2"></i>
                    {t.title}
                  </h1>
                </div>

                <form
                  onSubmit={handleSubmit}
                  encType="multipart/form-data"
                  className="card-body p-3 p-md-4 p-lg-5"
                >
                  {/* Personal Information Section */}
                  <div className="mb-4 mb-md-5">
                    <h5
                      className="fw-bold mb-3 mb-md-4"
                      style={{ color: "#0A2362" }}
                    >
                      <i className="fas fa-user-circle me-2"></i>
                      {language === "mr"
                        ? "वैयक्तिक माहिती"
                        : "Personal Information"}
                    </h5>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="form-floating">
                          <input
                            type="text"
                            name="name"
                            id="nameInput"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-control"
                            placeholder={t.namePlaceholder}
                            style={{
                              borderLeft: "3px solid #0A2362",
                              borderRadius: "0 5px 5px 0",
                            }}
                          />
                          <label
                            htmlFor="nameInput"
                            style={{ color: "#6c757d" }}
                          >
                            {t.fullName}
                          </label>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-floating">
                          <input
                            type="tel"
                            name="phone"
                            id="phoneInput"
                            value={formData.phone}
                            onChange={handleChange}
                            className="form-control"
                            placeholder={t.phonePlaceholder}
                            maxLength={10}
                            inputMode="numeric"
                            style={{
                              borderLeft: "3px solid #0A2362",
                              borderRadius: "0 5px 5px 0",
                            }}
                          />
                          <label
                            htmlFor="phoneInput"
                            style={{ color: "#6c757d" }}
                          >
                            {t.phone}
                          </label>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-floating">
                          <select
                            className="form-select"
                            name="policeStation"
                            id="policeStationSelect"
                            value={selectedPoliceStation}
                            onChange={handleChange}
                            required
                            style={{
                              borderLeft: "3px solid #0A2362",
                              borderRadius: "0 5px 5px 0",
                              paddingTop: "1.625rem",
                              paddingBottom: "0.625rem", // Added bottom padding
                              height: "calc(3.5rem + 2px)", // Explicit height
                            }}
                          >
                            <option value=""></option>
                            {policeStations.map((station, i) => (
                              <option key={i} value={station.en}>
                                {language === "mr" ? station.mr : station.en}
                              </option>
                            ))}
                          </select>
                          <label
                            htmlFor="policeStationSelect"
                            style={{
                              color: "#6c757d",
                              paddingTop: "0.5rem", // Added padding to label
                              paddingBottom: "0.5rem", // Added padding to label
                              height: "auto", // Allow label to expand
                            }}
                          >
                            {language === "mr"
                              ? "तुमचे पोलीस स्टेशन निवडा"
                              : "Select your police station"}
                            <span className="text-danger">*</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Section */}
                  <div className="mb-4 mb-md-5">
                    <h5
                      className="fw-bold mb-3 mb-md-4"
                      style={{ color: "#0A2362" }}
                    >
                      <i className="fas fa-edit me-2"></i>
                      {language === "mr" ? "तुमचा अभिप्राय" : "Your Feedback"}
                    </h5>

                    <div className="form-floating mb-3 mb-md-4">
                      <textarea
                        name="description"
                        id="descriptionTextarea"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={t.descriptionPlaceholder}
                        style={{
                          height: windowWidth < 768 ? "100px" : "120px",
                          borderLeft: "3px solid #0A2362",
                          borderRadius: "0 5px 5px 0",
                        }}
                      ></textarea>
                      <label
                        htmlFor="descriptionTextarea"
                        style={{ color: "#6c757d" }}
                      >
                        {t.description} <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex justify-content-between mt-2">
                        <small
                          className="text-muted"
                          style={{
                            fontSize: windowWidth < 768 ? "0.75rem" : "0.85rem",
                          }}
                        >
                          {t.descriptionNote}
                        </small>
                        <small
                          className="text-muted"
                          style={{
                            fontSize: windowWidth < 768 ? "0.75rem" : "0.85rem",
                          }}
                        >
                          {
                            formData.description
                              .trim()
                              .split(/\s+/)
                              .filter(Boolean).length
                          }{" "}
                          / 50 {language === "mr" ? "शब्द" : "words"}
                        </small>
                      </div>
                    </div>

                    {/* Overall Rating with Interactive Stars */}
                    <div className="mb-3 mb-md-4">
                      <label
                        className="form-label fw-bold d-block mb-2 mb-md-3"
                        style={{ color: "#0A2362" }}
                      >
                        {t.overallRating} <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          name="overallRating"
                          value={formData.overallRating}
                          onChange={handleChange}
                          className="form-range flex-grow-1 me-2 me-md-3"
                          style={{
                            height: windowWidth < 768 ? "6px" : "8px",
                            cursor: "pointer",
                          }}
                        />
                        <div
                          className="rating-display text-center px-2 px-md-3 py-1 py-md-2 rounded"
                          style={{
                            minWidth: windowWidth < 768 ? "70px" : "80px",
                            background: "#0A2362",
                            color: "white",
                            fontWeight: "bold",
                            transition: "all 0.3s ease",
                            fontSize: windowWidth < 768 ? "0.85rem" : "1rem",
                          }}
                        >
                          {formData.overallRating} / 10
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Department Ratings - Enhanced Table */}
                  <div className="mb-3 mb-md-4">
                    <h5 className="fw-bold mb-2 mb-md-3" style={{ color: "#0A2362", fontSize: windowWidth < 768 ? "1rem" : "1.25rem" }}>
                      <i className="fas fa-list-alt me-1 me-md-2"></i>
                      {t.departmentRatingsHeading}
                    </h5>

                    <div className="table-responsive">
                      <table className="table table-hover mb-0" style={{ fontSize: windowWidth < 768 ? "0.75rem" : "0.9rem" }}>
                        <thead>
                          <tr style={{ background: "#0A2362", color: "white" }}>
                            <th style={{ width: "5%", padding: windowWidth < 768 ? "0.3rem" : "0.5rem" }}>#</th>
                            <th style={{ minWidth: windowWidth < 768 ? "80px" : "120px", padding: windowWidth < 768 ? "0.3rem" : "0.5rem" }}>
                              {t.tableHeaders.department}
                            </th>
                            <th style={{ minWidth: windowWidth < 768 ? "80px" : "150px", padding: windowWidth < 768 ? "0.3rem" : "0.5rem" }}>
                              {t.tableHeaders.rating}
                            </th>
                            <th style={{ minWidth: windowWidth < 768 ? "40px" : "80px", padding: windowWidth < 768 ? "0.3rem" : "0.5rem" }}>
                              {t.tableHeaders.value}
                            </th>
                            <th style={{ width: windowWidth < 768 ? "30px" : "50px", padding: windowWidth < 768 ? "0.3rem" : "0.5rem" }} className="text-center">
                              {t.tableHeaders.select}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {deptRatings.map((dept, idx) => (
                            <tr key={idx} style={{ verticalAlign: "middle" }}>
                              <td className="fw-bold" style={{ padding: windowWidth < 768 ? "0.3rem" : "0.5rem" }}>{idx + 1}</td>
                              <td className="fw-bold" style={{ padding: windowWidth < 768 ? "0.3rem" : "0.5rem" }}>
                                {dept.department}
                              </td>
                              <td style={{ padding: windowWidth < 768 ? "0.3rem" : "0.5rem" }}>
                                <div className="d-flex align-items-center">
                                  <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={dept.rating}
                                    onChange={(e) => handleDeptSlider(idx, e.target.value)}
                                    className="form-range me-1 me-md-2"
                                    style={{
                                      height: windowWidth < 768 ? "3px" : "5px",
                                      cursor: "pointer",
                                      minWidth: windowWidth < 768 ? "60px" : "100px"
                                    }}
                                  />
                                </div>
                              </td>
                              <td style={{ padding: windowWidth < 768 ? "0.3rem" : "0.5rem" }}>
                                <span
                                  className="badge rounded-pill px-1 py-0"
                                  style={{
                                    background: "#0A2362",
                                    whiteSpace: "nowrap"
                                  }}
                                >
                                  {dept.rating}/10
                                </span>
                              </td>
                              <td className="text-center" style={{ padding: windowWidth < 768 ? "0.3rem" : "0.5rem" }}>
                                <div className="form-check form-switch d-flex justify-content-center m-0">
                                  <input
                                    className="form-check-input m-0"
                                    type="checkbox"
                                    role="switch"
                                    checked={dept.checked}
                                    onChange={(e) => handleDeptCheck(idx, e.target.checked)}
                                    style={{
                                      width: windowWidth < 768 ? "1.8em" : "2.5em",
                                      height: windowWidth < 768 ? "1em" : "1.3em",
                                      cursor: "pointer",
                                      backgroundColor: dept.checked ? "#0A2362" : ""
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Submit Button with Animation */}
                  <div className="text-center mt-3 mt-md-4">
                    <button
                      className="btn btn-lg px-4 px-md-5 py-2 py-md-3 fw-bold"
                      style={{
                        background:
                          "linear-gradient(to right, #0A2362, #1a4a9a)",
                        color: "white",
                        borderRadius: "50px",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(10, 35, 98, 0.3)",
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        minWidth: windowWidth < 768 ? "160px" : "200px",
                        fontSize: windowWidth < 768 ? "0.9rem" : "1rem",
                      }}
                      type="submit"
                      disabled={isSubmitting}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(to right, #1a4a9a, #0A2362)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 20px rgba(10, 35, 98, 0.4)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(to right, #0A2362, #1a4a9a)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 15px rgba(10, 35, 98, 0.3)";
                        e.currentTarget.style.transform = "";
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          {language === "mr" ? "पाठवत आहे..." : "Submitting..."}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          {t.submit}
                        </>
                      )}
                    </button>
                  </div>
                </form>
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
            {" "}
            {/* Added justify-content-center */}
            <div className="col-12 text-center">
              {" "}
              {/* Changed to col-12 and text-center */}
              <p
                className="mb-0"
                style={{ fontSize: windowWidth < 768 ? "0.85rem" : "1rem" }}
              >
                <i className="fas fa-copyright me-2"></i>
                {new Date().getFullYear()}{" "}
                {language === "mr" ? "अहिल्यानगर पोलीस" : "Ahilyanagar Police"}
              </p>
            </div>
          </div>
        </div>
      </footer>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={language === "mr"}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default FeedbackForm;