import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Save, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import ReactQuill from "react-quill";
import axios from "axios";
import "react-quill/dist/quill.snow.css";
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
  ToastContainer,
} from "./toastmessage";
import { Link } from "react-router-dom";

const AddData = () => {
  const initialFormData = {
    title: "",
    description: "",
    fiidii_activity: [
      {
        currentDate: "",
        fiiNet: "",
        diiNet: "",
      },
    ],
    market_bulletin: "",
    nifty_tech_analysis: [
      {
        description: "",
        resistance_pivots: [""],
        support_pivots: [""],
      },
    ],
    bank_nifty_tech_analysis: [
      {
        description: "",
        resistance_pivots: [""],
        support_pivots: [""],
      },
    ],
    bullish_outlook: "",
    bearish_outlook: "",
    corporate_action: [
      {
        company_name: "",
        description: "",
        tag: "",
        price_range: "",
      },
    ],
    earning_report: [
      {
        company_name: "",
        description: "",
        price_range: "",
      },
    ],
    upcoming_ipos: [
      {
        dates: "",
        company_name: "",
        price_range: "",
        lot_size: "",
        subscription: "",
      },
    ],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "link",
    "image"
  ];
  
  const formatDate = (date) => {
    if (!date) return "";
    
    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      return date;
    }
    
    try {

      const d = new Date(date);
      if (isNaN(d.getTime())) {
        console.error("Invalid date input:", date);
        return "";
      }
      
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = showLoadingToast("Saving data...");
    setLoading(true);
  
    try {
      const dataToSubmit = JSON.parse(JSON.stringify(formData));
      if (dataToSubmit.fiidii_activity) {
        dataToSubmit.fiidii_activity = dataToSubmit.fiidii_activity.map((activity) => {
          return {
            ...activity,
            currentDate: activity.currentDate ? formatDate(activity.currentDate) : ""
          };
        }).filter(activity => activity.currentDate); 
      }
  
      if (dataToSubmit.upcoming_ipos) {
        dataToSubmit.upcoming_ipos = dataToSubmit.upcoming_ipos.map((ipo) => {
          return {
            ...ipo,
            dates: ipo.dates ? formatDate(ipo.dates) : ""
          };
        }).filter(ipo => ipo.dates);
      }
  
      console.log("Sanitized data to submit:", dataToSubmit);
  
      const response = await axios.post(
        "https://stage.api.tradexpert.ai/api/v1/admin/whatsnew",
        dataToSubmit
      );
  
      toast.dismiss(loadingToast);
      showSuccessToast("Data saved successfully!");
      setSubmitted(true);
      setFormData(initialFormData);
      setTimeout(() => setSubmitted(false), 2000);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Full submission error:", error);
      showErrorToast(
        error.response?.data?.message || 
        error.message || 
        "Error saving data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, arrayName, index, field) => {
    if (arrayName) {
      const updatedArray = [...formData[arrayName]]
      if (field.includes("[")) {
        const [baseField, indexStr] = field.split("[");
        const pivotIndex = parseInt(indexStr.replace("]", ""));
        updatedArray[index][baseField][pivotIndex] = e.target.value;
      } else {
        updatedArray[index][field] = e.target.value;
      }

      setFormData((prev) => ({
        ...prev,
        [arrayName]: updatedArray,
      }));
      
    } else {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditorChange = (content, field) => {
    setFormData((prevData) => {
      const matches = field.match(/(\w+)\[(\d+)\]\.(\w+)/);

      if (matches) {
        const [, arrayName, indexStr, subField] = matches;
        const index = parseInt(indexStr);
        const updatedArray = [...prevData[arrayName]];
        updatedArray[index] = {
          ...updatedArray[index],
          [subField]: content,
        };

        return {
          ...prevData,
          [arrayName]: updatedArray,
        };
      }
      return {
        ...prevData,
        [field]: content,
      };
    });
  };

  const addArrayItem = (arrayName, template) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { ...template }],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const addPivotItem = (arrayName, analysisIndex, field) => {
    const updatedAnalysis = [...formData[arrayName]];
    updatedAnalysis[analysisIndex][field].push("");
    setFormData((prev) => ({
      ...prev,
      [arrayName]: updatedAnalysis,
    }));
  };

  const removePivotItem = (arrayName, analysisIndex, field, pivotIndex) => {
    const updatedAnalysis = [...formData[arrayName]];
    updatedAnalysis[analysisIndex][field] = updatedAnalysis[analysisIndex][
      field
    ].filter((_, i) => i !== pivotIndex);
    setFormData((prev) => ({
      ...prev,
      [arrayName]: updatedAnalysis,
    }));
  };
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Saving...
        </>
      );
    }
    if (submitted) {
      return (
        <>
          <Save className="w-5 h-5" />
          Saved
        </>
      );
    }
    return (
      <>
        <Save className="w-5 h-5 group-hover:animate-bounce" />
        Save
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <ToastContainer />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-6 left-6 z-20"
      >
        <Link
          to="/"
          className="group flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white
                    px-4 py-2 rounded-xl border border-slate-700 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.form
          onSubmit={handleSubmit}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div className="text-center space-y-4" variants={itemVariants}>
            <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-4">
              <Sparkles className="w-8 h-8 text-teal-500" />
              What's New
              <Sparkles className="w-8 h-8 text-teal-500" />
            </h1>
          </motion.div>

          {/* Basic Information */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <h2 className="text-xl font-semibold text-white mb-6">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700
                           text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Description
                </label>
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={(content) =>
                    handleEditorChange(content, "description")
                  }
                  modules={modules}
                  formats={formats}
                  className="bg-slate-900 text-white"
                />
              </div>
            </div>
          </motion.div>

          {/* Market Bulletin */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <h2 className="text-xl font-semibold text-white mb-6">
              Market Bulletin
            </h2>
            <ReactQuill
              theme="snow"
              value={formData.market_bulletin}
              onChange={(content) =>
                handleEditorChange(content, "market_bulletin")
              }
              modules={modules}
              formats={formats}
              className="bg-slate-900 text-white"
            />
          </motion.div>

          {/* Nifty Tech Analysis */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <h2 className="text-xl font-semibold text-white mb-6">
              Nifty Tech Analysis
            </h2>
            {formData.nifty_tech_analysis.map((item, index) => (
              <div key={index} className="bg-slate-900 p-4 rounded-lg mb-4">
                <div className="grid gap-4">
                  <label className="text-sm font-medium text-slate-300">
                    Description
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={item.description}
                    onChange={(content) =>
                      handleEditorChange(
                        content,
                        `nifty_tech_analysis[${index}].description`
                      )
                    }
                    modules={modules}
                    formats={formats}
                    className="bg-slate-900 text-white"
                  />
                  <div className="mt-10">
                    <label className="text-sm font-medium text-slate-300">
                      Resistance Pivots
                    </label>
                    {item.resistance_pivots.map((pivot, pivotIndex) => (
                      <div
                        key={pivotIndex}
                        className="flex items-center gap-2 mb-2"
                      >
                        <input
                          type="text"
                          value={pivot}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "nifty_tech_analysis",
                              index,
                              `resistance_pivots[${pivotIndex}]`
                            )
                          }
                          className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removePivotItem(
                              "nifty_tech_analysis",
                              index,
                              "resistance_pivots",
                              pivotIndex
                            )
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        addPivotItem(
                          "nifty_tech_analysis",
                          index,
                          "resistance_pivots"
                        )
                      }
                      className="text-teal-400 hover:text-teal-300"
                    >
                      Add Pivot
                    </button>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-300">
                      Support Pivots
                    </label>
                    {item.support_pivots.map((pivot, pivotIndex) => (
                      <div
                        key={pivotIndex}
                        className="flex items-center gap-2 mb-2"
                      >
                        <input
                          type="text"
                          value={pivot}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "nifty_tech_analysis",
                              index,
                              `support_pivots[${pivotIndex}]`
                            )
                          }
                          className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removePivotItem(
                              "nifty_tech_analysis",
                              index,
                              "support_pivots",
                              pivotIndex
                            )
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        addPivotItem(
                          "nifty_tech_analysis",
                          index,
                          "support_pivots"
                        )
                      }
                      className="text-teal-400 hover:text-teal-300"
                    >
                      Add Pivot
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Bank Nifty Tech Analysis */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <h2 className="text-xl font-semibold text-white mb-6">
              Bank Nifty Tech Analysis
            </h2>
            {formData.bank_nifty_tech_analysis.map((item, index) => (
              <div key={index} className="bg-slate-900 p-4 rounded-lg mb-4">
                <div className="grid gap-4">
                  <label className="text-sm font-medium text-slate-300">
                    Description
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={item.description}
                    onChange={(content) =>
                      handleEditorChange(
                        content,
                        `bank_nifty_tech_analysis[${index}].description`
                      )
                    }
                    modules={modules}
                    formats={formats}
                    className="bg-slate-900 text-white"
                  />
                  <div className="mt-10">
                    <label className="text-sm font-medium text-slate-300">
                      Resistance Pivots
                    </label>
                    {item.resistance_pivots.map((pivot, pivotIndex) => (
                      <div
                        key={pivotIndex}
                        className="flex items-center gap-2 mb-2"
                      >
                        <input
                          type="text"
                          value={pivot}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "bank_nifty_tech_analysis",
                              index,
                              `resistance_pivots[${pivotIndex}]`
                            )
                          }
                          className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removePivotItem(
                              "bank_nifty_tech_analysis",
                              index,
                              "resistance_pivots",
                              pivotIndex
                            )
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        addPivotItem(
                          "bank_nifty_tech_analysis",
                          index,
                          "resistance_pivots"
                        )
                      }
                      className="text-teal-400 hover:text-teal-300"
                    >
                      Add Pivot
                    </button>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-300">
                      Support Pivots
                    </label>
                    {item.support_pivots.map((pivot, pivotIndex) => (
                      <div
                        key={pivotIndex}
                        className="flex items-center gap-2 mb-2"
                      >
                        <input
                          type="text"
                          value={pivot}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "bank_nifty_tech_analysis",
                              index,
                              `support_pivots[${pivotIndex}]`
                            )
                          }
                          className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removePivotItem(
                              "bank_nifty_tech_analysis",
                              index,
                              "support_pivots",
                              pivotIndex
                            )
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        addPivotItem(
                          "bank_nifty_tech_analysis",
                          index,
                          "support_pivots"
                        )
                      }
                      className="text-teal-400 hover:text-teal-300"
                    >
                      Add Pivot
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Bullish Outlook */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <label className="block text-sm font-medium text-slate-300 mb-4">
              Bullish Outlook
            </label>
            <ReactQuill
              theme="snow"
              value={formData.bullish_outlook}
              onChange={(content) =>
                handleEditorChange(content, "bullish_outlook")
              }
              modules={modules}
              formats={formats}
              className="bg-slate-900 text-white"
            />
          </motion.div>

          {/* Bearish Outlook */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <label className="block text-sm font-medium text-slate-300 mb-4">
              Bearish Outlook
            </label>
            <ReactQuill
              theme="snow"
              value={formData.bearish_outlook}
              onChange={(content) =>
                handleEditorChange(content, "bearish_outlook")
              }
              modules={modules}
              formats={formats}
              className="bg-slate-900 text-white"
            />
          </motion.div>

          {/* Corporate Actions */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                Corporate Actions
              </h2>
              <button
                type="button"
                onClick={() =>
                  addArrayItem("corporate_action", {
                    company_name: "",
                    description: "",
                    tag: "",
                    price_range: "",
                  })
                }
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
              >
                Add Corporate Action
              </button>
            </div>
            {formData.corporate_action.map((item, index) => (
              <div key={index} className="bg-slate-900 p-4 rounded-lg mb-4">
                <div className="grid gap-4">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={item.company_name}
                    onChange={(e) =>
                      handleChange(e, "corporate_action", index, "company_name")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleChange(e, "corporate_action", index, "description")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Tag"
                    value={item.tag}
                    onChange={(e) =>
                      handleChange(e, "corporate_action", index, "tag")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Price Range"
                    value={item.price_range}
                    onChange={(e) =>
                      handleChange(e, "corporate_action", index, "price_range")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("corporate_action", index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Earning Reports */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                Earning Reports
              </h2>
              <button
                type="button"
                onClick={() =>
                  addArrayItem("earning_report", {
                    company_name: "",
                    description: "",
                    price_range: "",
                  })
                }
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
              >
                Add Earning Report
              </button>
            </div>
            {formData.earning_report.map((item, index) => (
              <div key={index} className="bg-slate-900 p-4 rounded-lg mb-4">
                <div className="grid gap-4">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={item.company_name}
                    onChange={(e) =>
                      handleChange(e, "earning_report", index, "company_name")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleChange(e, "earning_report", index, "description")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Price Range"
                    value={item.price_range}
                    onChange={(e) =>
                      handleChange(e, "earning_report", index, "price_range")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("earning_report", index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Upcoming IPOs */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                Upcoming IPOs
              </h2>
              <button
                type="button"
                onClick={() =>
                  addArrayItem("upcoming_ipos", {
                    company_name: "",
                    dates: "",
                    price_range: "",
                    lot_size: "",
                    subscription: "",
                  })
                }
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
              >
                Add IPO
              </button>
            </div>
            {formData.upcoming_ipos.map((item, index) => (
              <div key={index} className="bg-slate-900 p-4 rounded-lg mb-4">
                <div className="grid gap-4">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={item.company_name}
                    onChange={(e) =>
                      handleChange(e, "upcoming_ipos", index, "company_name")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <input
                    type="date"
                    placeholder="Dates"
                    value={item.dates}
                    onChange={(e) =>
                      handleChange(e, "upcoming_ipos", index, "dates")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Price Range"
                    value={item.price_range}
                    onChange={(e) =>
                      handleChange(e, "upcoming_ipos", index, "price_range")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Lot Size"
                    value={item.lot_size}
                    onChange={(e) =>
                      handleChange(e, "upcoming_ipos", index, "lot_size")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Subscription"
                    value={item.subscription}
                    onChange={(e) =>
                      handleChange(e, "upcoming_ipos", index, "subscription")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("upcoming_ipos", index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </motion.div>

          {/* FII/DII Activity */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                FII/DII Activity
              </h2>
              <button
                type="button"
                onClick={() =>
                  addArrayItem("fiidii_activity", {
                    currentDate: "",
                    fiiNet: "",
                    diiNet: "",
                  })
                }
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
              >
                Add FII/DII Activity
              </button>
            </div>
            {formData.fiidii_activity.map((item, index) => (
              <div key={index} className="bg-slate-900 p-4 rounded-lg mb-4">
                <div className="grid gap-4">
                  <input
                    type="date"
                    placeholder="Current Date"
                    value={item.currentDate}
                    onChange={(e) =>
                      handleChange(e, "fiidii_activity", index, "currentDate")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="FII Net"
                    value={item.fiiNet}
                    onChange={(e) =>
                      handleChange(e, "fiidii_activity", index, "fiiNet")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="DII Net"
                    value={item.diiNet}
                    onChange={(e) =>
                      handleChange(e, "fiidii_activity", index, "diiNet")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("fiidii_activity", index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
          {/* Submit Button */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center pt-6"
          >
            <button
              type="submit"
              disabled={loading || submitted}
              className={`group flex items-center gap-2 bg-teal-500 hover:bg-teal-600
                       text-white px-8 py-4 rounded-xl font-medium transition-all duration-300
                       ${
                         loading || submitted
                           ? "opacity-75 cursor-not-allowed"
                           : "hover:scale-102"
                       }`}
            >
              {getButtonContent()}
            </button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default AddData;
