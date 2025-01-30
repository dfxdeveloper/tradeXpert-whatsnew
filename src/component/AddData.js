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
    news: [
      {
        title: "",
        description: "",
        pubDate: "",
      },
    ],
    corporate_action: [
      {
        title: "",
        description: "",
        type: "Dividend",
      },
    ],
    earning_report: [
      {
        title: "",
        description: "",
        type: "Result",
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
    todays_learning: "",
    risk_management: "",
    trading_strategy: "",
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
      ["link"],
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
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = showLoadingToast("Saving data...");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://stage.api.tradexpert.ai/api/v1/admin/whatsnew",
        formData
      );
      toast.dismiss(loadingToast);
      showSuccessToast("Data saved successfully!");
      setSubmitted(true);
      setFormData(initialFormData);
      setTimeout(() => setSubmitted(false), 2000);
    } catch (error) {
      toast.dismiss(loadingToast);
      showErrorToast(error.message || "Error saving data");
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e, arrayName, index, field) => {
    if (arrayName) {
      const updatedArray = [...formData[arrayName]];
      if (field === "pubDate") {
       
        const dateValue = e.target.value; 
        if (dateValue) {
          const [year, month, day] = dateValue.split("-");
          const formattedDate = `${day}-${month}-${year}`; 
          updatedArray[index][field] = formattedDate;
        } else {
          updatedArray[index][field] = "";
        }
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
    setFormData((prev) => ({
      ...prev,
      [field]: content,
    }));
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

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const match = dateString.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`; 
    }
    return dateString;
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

          {/* News Section */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">News</h2>
              <button
                type="button"
                onClick={() =>
                  addArrayItem("news", {
                    title: "",
                    description: "",
                    pubDate: "",
                  })
                }
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
              >
                Add News
              </button>
            </div>
            {formData.news.map((item, index) => (
              <div key={index} className="bg-slate-900 p-4 rounded-lg mb-4">
                <div className="grid gap-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => handleChange(e, "news", index, "title")}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleChange(e, "news", index, "description")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  
                    <input
                      type="date"
                      placeholder="Publication Date"
                      value={formatDateForInput(item.pubDate)}
                      onChange={(e) =>
                        handleChange(e, "news", index, "pubDate")
                      }
                      className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  
                  <button
                    type="button"
                    onClick={() => removeArrayItem("news", index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
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
                    title: "",
                    description: "",
                    type: "Dividend",
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
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) =>
                      handleChange(e, "corporate_action", index, "title")
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
                  <select
                    value={item.type}
                    onChange={(e) =>
                      handleChange(e, "corporate_action", index, "type")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Dividend">Dividend</option>
                    <option value="Split">Split</option>
                    <option value="Bonus">Bonus</option>
                  </select>
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
                    title: "",
                    description: "",
                    type: "Result",
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
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) =>
                      handleChange(e, "earning_report", index, "title")
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
                  <select
                    value={item.type}
                    onChange={(e) =>
                      handleChange(e, "earning_report", index, "type")
                    }
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Result">Result</option>
                    <option value="Preview">Preview</option>
                  </select>
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
                    type="text"
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

          {/* Rich Text Editor Fields */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Today's Learning */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-4">
                Today's Learning
              </label>
              <ReactQuill
                theme="snow"
                value={formData.todays_learning}
                onChange={(content) =>
                  handleEditorChange(content, "todays_learning")
                }
                modules={modules}
                formats={formats}
                className="bg-slate-900 text-white"
              />
            </div>

            {/* Risk Management */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-4">
                Risk Management
              </label>
              <ReactQuill
                theme="snow"
                value={formData.risk_management}
                onChange={(content) =>
                  handleEditorChange(content, "risk_management")
                }
                modules={modules}
                formats={formats}
                className="bg-slate-900 text-white"
              />
            </div>

            {/* Trading Strategy */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-4">
                Trading Strategy
              </label>
              <ReactQuill
                theme="snow"
                value={formData.trading_strategy}
                onChange={(content) =>
                  handleEditorChange(content, "trading_strategy")
                }
                modules={modules}
                formats={formats}
                className="bg-slate-900 text-white"
              />
            </div>
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
