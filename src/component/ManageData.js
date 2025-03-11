import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Pencil,
  Trash2,
  ArrowLeft,
  Loader2,
  Save,
  X,
  AlertTriangle,
  TableIcon,
} from "lucide-react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Link } from "react-router-dom";
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
  ToastContainer,
} from "./toastmessage";

const ManageData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize with the same structure as AddData component
  const initialEditFormData = {
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
        tag: "",
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
    top_gainers: [
      {
        stock_name: "",
        price: "",
        value: "",
      },
    ],
    top_losers: [
      {
        stock_name: "",
        price: "",
        value: "",
      },
    ],
    volume_gainers: [
      {
        stock_name: "",
        price: "",
        value: "",
      },
    ],
    sectoral_performance: [
      {
        price: "",
        value: "",
        title: "",
      },
    ],
    market_outlook: [
      {
        bearish: "",
        bullish: "",
        neutral: "",
      },
    ],
  };

  const [editFormData, setEditFormData] = useState(initialEditFormData);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
      [{ indent: "-1" }, { indent: "+1" }],
    ],
    clipboard: {
      matchVisual: false,
    },
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
    "image",
    "whitespace",
    "indent",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://stage.api.tradexpert.ai/api/v1/user/whatsnew"
      );
      if (response.data.whatsnew && response.data.whatsnew) {
        setData(
          Array.isArray(response.data.whatsnew) ? response.data.whatsnew : []
        );
      } else {
        setData([]);
        console.error(
          "API response format is unexpected:",
          response.data.whatsnew
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorToast("Failed to load data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    const itemCopy = JSON.parse(JSON.stringify(item));
    const formData = {
      ...initialEditFormData,
      ...itemCopy,
    };
    [
      "fiidii_activity",
      "nifty_tech_analysis",
      "bank_nifty_tech_analysis",
      "corporate_action",
      "earning_report",
      "upcoming_ipos",
      "top_gainers",
      "top_losers",
      "volume_gainers",
      "sectoral_performance",
      "market_outlook",
    ].forEach((field) => {
      if (
        !formData[field] ||
        !Array.isArray(formData[field]) ||
        formData[field].length === 0
      ) {
        formData[field] = initialEditFormData[field];
      }
    });

    setEditFormData(formData);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleChange = (e, arrayName, index, field) => {
    if (arrayName) {
      const updatedArray = [...editFormData[arrayName]];
      if (field.includes("[")) {
        const [baseField, indexStr] = field.split("[");
        const pivotIndex = Number.parseInt(indexStr.replace("]", ""));
        updatedArray[index][baseField][pivotIndex] = e.target.value;
      } else {
        updatedArray[index][field] = e.target.value;
      }

      setEditFormData((prev) => ({
        ...prev,
        [arrayName]: updatedArray,
      }));
    } else {
      const { name, value } = e.target;
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditorChange = (content, field) => {
    setEditFormData((prevData) => {
      const matches = field.match(/(\w+)\[(\d+)\]\.(\w+)/);

      if (matches) {
        const [, arrayName, indexStr, subField] = matches;
        const index = Number.parseInt(indexStr);
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
    setEditFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { ...template }],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setEditFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const addPivotItem = (arrayName, analysisIndex, field) => {
    const updatedAnalysis = [...editFormData[arrayName]];
    updatedAnalysis[analysisIndex][field].push("");
    setEditFormData((prev) => ({
      ...prev,
      [arrayName]: updatedAnalysis,
    }));
  };

  const removePivotItem = (arrayName, analysisIndex, field, pivotIndex) => {
    const updatedAnalysis = [...editFormData[arrayName]];
    updatedAnalysis[analysisIndex][field] = updatedAnalysis[analysisIndex][
      field
    ].filter((_, i) => i !== pivotIndex);
    setEditFormData((prev) => ({
      ...prev,
      [arrayName]: updatedAnalysis,
    }));
  };

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const loadingToast = showLoadingToast("Updating data...");

    try {
      const dataToSubmit = JSON.parse(JSON.stringify(editFormData));

      // Format dates for fiidii_activity
      if (dataToSubmit.fiidii_activity) {
        dataToSubmit.fiidii_activity = dataToSubmit.fiidii_activity
          .map((activity) => {
            return {
              ...activity,
              currentDate: activity.currentDate
                ? formatDate(activity.currentDate)
                : "",
            };
          })
          .filter((activity) => activity.currentDate);
      }

      // Format dates for upcoming_ipos
      if (dataToSubmit.upcoming_ipos) {
        dataToSubmit.upcoming_ipos = dataToSubmit.upcoming_ipos
          .map((ipo) => {
            return {
              ...ipo,
              dates: ipo.dates ? formatDate(ipo.dates) : "",
            };
          })
          .filter((ipo) => ipo.dates);
      }

      await axios.put(
        `https://stage.api.tradexpert.ai/api/v1/admin/whatsnew/${selectedItem._id}`,
        dataToSubmit
      );

      toast.dismiss(loadingToast);
      showSuccessToast("Data updated successfully!");
      setIsEditModalOpen(false);
      fetchData(); // Refresh data
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error updating data:", error);
      showErrorToast(
        error.response?.data?.message || error.message || "Error updating data"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const loadingToast = showLoadingToast("Deleting data...");

    try {
      await axios.delete(
        `https://stage.api.tradexpert.ai/api/v1/admin/whatsnew/${selectedItem._id}`
      );

      toast.dismiss(loadingToast);
      showSuccessToast("Data deleted successfully!");
      setIsDeleteModalOpen(false);
      fetchData(); // Refresh data
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error deleting data:", error);
      showErrorToast(
        error.response?.data?.message || error.message || "Error deleting data"
      );
    } finally {
      setIsDeleting(false);
    }
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div className="text-center space-y-4" variants={itemVariants}>
            <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-4">
              <TableIcon className="w-8 h-8 text-teal-500" />
              Manage Data
              <TableIcon className="w-8 h-8 text-teal-500" />
            </h1>
          </motion.div>

          {/* Data Table */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <h2 className="text-xl font-semibold text-white mb-6">
              What's New Data
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                <span className="ml-3 text-white">Loading data...</span>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>No data available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300 hidden md:table-cell">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="px-4 py-4 text-white">{item.title}</td>
                        <td className="px-4 py-4 text-white hidden md:table-cell">
                          <div className="max-w-xs truncate">
                            {item.description ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html:
                                    item.description.substring(0, 100) + "...",
                                }}
                              />
                            ) : (
                              <span className="text-slate-400">
                                No description
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                              aria-label="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Edit Data</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              {/*Market Sentiments*/}
              <motion.div
                variants={itemVariants}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700"
              >
                <div className="flex justify-between items-center mt-6 mb-6">
                  <h5 className="text-lg font-semibold text-white">
                    Market Outlook
                  </h5>
                </div>
                {editFormData.market_outlook.map((item, index) => (
                  <div key={index} className="bg-slate-900 p-4 rounded-lg mb-4">
                    <div className="grid gap-4">
                      <input
                        type="text"
                        placeholder="Bullish"
                        value={item.bullish}
                        onChange={(e) =>
                          handleChange(e, "market_outlook", index, "bullish")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Neutral"
                        value={item.neutral}
                        onChange={(e) =>
                          handleChange(e, "market_outlook", index, "neutral")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Bearish"
                        value={item.bearish}
                        onChange={(e) =>
                          handleChange(e, "market_outlook", index, "bearish")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
              {/* Basic Information */}
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editFormData.title || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
                               text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">
                      Description
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={editFormData.description || ""}
                      onChange={(content) =>
                        handleEditorChange(content, "description")
                      }
                      modules={modules}
                      formats={formats}
                      className="bg-slate-900 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Trending Stocks */}
              <motion.div
                variants={itemVariants}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700"
              >
                <h2 className="text-xl font-semibold text-white">
                  Trending Stocks
                </h2>
                {/* Top Gainers */}
                <div className="flex justify-between items-center mt-6 mb-6">
                  <h5 className="text-lg font-semibold text-white">
                    Top Gainers
                  </h5>
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem("top_gainers", {
                        stock_name: "",
                        price: "",
                        value: "",
                      })
                    }
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
                  >
                    Add Row
                  </button>
                </div>
                {editFormData.top_gainers.map((item, index) => (
                  <div key={index} className="bg-slate-900 p-4 rounded-lg mb-4">
                    <div className="grid gap-4">
                      <input
                        type="text"
                        placeholder="Stock Name"
                        value={item.stock_name}
                        onChange={(e) =>
                          handleChange(e, "top_gainers", index, "stock_name")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) =>
                          handleChange(e, "top_gainers", index, "price")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) =>
                          handleChange(e, "top_gainers", index, "value")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem("top_gainers", index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                {/* Top Losers */}
                <div className="flex justify-between items-center mt-6 mb-6">
                  <h5 className="text-lg font-semibold text-white">
                    Top Losers
                  </h5>
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem("top_losers", {
                        stock_name: "",
                        price: "",
                        value: "",
                      })
                    }
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
                  >
                    Add Row
                  </button>
                </div>
                {editFormData.top_losers.map((item, index) => (
                  <div key={index} className="bg-slate-900 p-4 rounded-lg mb-4">
                    <div className="grid gap-4">
                      <input
                        type="text"
                        placeholder="Stock Name"
                        value={item.stock_name}
                        onChange={(e) =>
                          handleChange(e, "top_losers", index, "stock_name")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) =>
                          handleChange(e, "top_losers", index, "price")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) =>
                          handleChange(e, "top_losers", index, "value")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem("top_losers", index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                {/* Volume Gainers */}

                <div className="flex justify-between items-center mt-6 mb-6">
                  <h5 className="text-lg font-semibold text-white">
                    Volume Gainers
                  </h5>
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem("volume_gainers", {
                        stock_name: "",
                        price: "",
                        value: "",
                      })
                    }
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
                  >
                    Add Row
                  </button>
                </div>
                {editFormData.volume_gainers.map((item, index) => (
                  <div key={index} className="bg-slate-900 p-4 rounded-lg mb-4">
                    <div className="grid gap-4">
                      <input
                        type="text"
                        placeholder="Stock Name"
                        value={item.stock_name}
                        onChange={(e) =>
                          handleChange(e, "volume_gainers", index, "stock_name")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) =>
                          handleChange(e, "volume_gainers", index, "price")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) =>
                          handleChange(e, "volume_gainers", index, "value")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem("volume_gainers", index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Sectoral Performance */}
              <motion.div
                variants={itemVariants}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700"
              >
                <div className="flex justify-between items-center mt-6 mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Sectoral Performance
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem("sectoral_performance", {
                        price: "",
                        value: "",
                        title: "",
                      })
                    }
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
                  >
                    Add Row
                  </button>
                </div>
                {editFormData.sectoral_performance.map((item, index) => (
                  <div key={index} className="bg-slate-900 p-4 rounded-lg mb-4">
                    <div className="grid gap-4">
                      <input
                        type="text"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) =>
                          handleChange(e, "sectoral_performance", index, "price")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) =>
                          handleChange(e, "sectoral_performance", index, "value")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Title"
                        value={item.title}
                        onChange={(e) =>
                          handleChange(e, "sectoral_performance", index, "title")
                        }
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeArrayItem("sectoral_performance", index)
                        }
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Market Bulletin */}
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Market Bulletin
                </h3>
                <ReactQuill
                  theme="snow"
                  value={editFormData.market_bulletin || ""}
                  onChange={(content) =>
                    handleEditorChange(content, "market_bulletin")
                  }
                  modules={modules}
                  formats={formats}
                  className="bg-slate-900 text-white"
                />
              </div>

              {/* Nifty Tech Analysis */}
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Nifty Tech Analysis
                </h3>
                {editFormData.nifty_tech_analysis.map((item, index) => (
                  <div key={index} className="bg-slate-800 p-4 rounded-lg mb-4">
                    <div className="grid gap-4">
                      <label className="text-sm font-medium text-slate-300">
                        Description
                      </label>
                      <ReactQuill
                        theme="snow"
                        value={item.description || ""}
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
                        {item.resistance_pivots &&
                          item.resistance_pivots.map((pivot, pivotIndex) => (
                            <div
                              key={pivotIndex}
                              className="flex items-center gap-2 mb-2"
                            >
                              <input
                                type="text"
                                value={pivot || ""}
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
                        {item.support_pivots &&
                          item.support_pivots.map((pivot, pivotIndex) => (
                            <div
                              key={pivotIndex}
                              className="flex items-center gap-2 mb-2"
                            >
                              <input
                                type="text"
                                value={pivot || ""}
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
              </div>

              {/* Bank Nifty Tech Analysis */}
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Bank Nifty Tech Analysis
                </h3>
                {editFormData.bank_nifty_tech_analysis.map((item, index) => (
                  <div key={index} className="bg-slate-800 p-4 rounded-lg mb-4">
                    <div className="grid gap-4">
                      <label className="text-sm font-medium text-slate-300">
                        Description
                      </label>
                      <ReactQuill
                        theme="snow"
                        value={item.description || ""}
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
                        {item.resistance_pivots &&
                          item.resistance_pivots.map((pivot, pivotIndex) => (
                            <div
                              key={pivotIndex}
                              className="flex items-center gap-2 mb-2"
                            >
                              <input
                                type="text"
                                value={pivot || ""}
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
                        {item.support_pivots &&
                          item.support_pivots.map((pivot, pivotIndex) => (
                            <div
                              key={pivotIndex}
                              className="flex items-center gap-2 mb-2"
                            >
                              <input
                                type="text"
                                value={pivot || ""}
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
              </div>

              {/* Bullish Outlook */}
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Bullish Outlook
                </h3>
                <ReactQuill
                  theme="snow"
                  value={editFormData.bullish_outlook || ""}
                  onChange={(content) =>
                    handleEditorChange(content, "bullish_outlook")
                  }
                  modules={modules}
                  formats={formats}
                  className="bg-slate-900 text-white"
                />
              </div>

              {/* Bearish Outlook */}
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Bearish Outlook
                </h3>
                <ReactQuill
                  theme="snow"
                  value={editFormData.bearish_outlook || ""}
                  onChange={(content) =>
                    handleEditorChange(content, "bearish_outlook")
                  }
                  modules={modules}
                  formats={formats}
                  className="bg-slate-900 text-white"
                />
              </div>

              {/* Corporate Actions */}
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Corporate Actions
                  </h3>
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
                {editFormData.corporate_action &&
                  editFormData.corporate_action.map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-800 p-4 rounded-lg mb-4"
                    >
                      <div className="grid gap-4">
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={item.company_name || ""}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "corporate_action",
                              index,
                              "company_name"
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description || ""}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "corporate_action",
                              index,
                              "description"
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Tag"
                          value={item.tag || ""}
                          onChange={(e) =>
                            handleChange(e, "corporate_action", index, "tag")
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Price Range"
                          value={item.price_range || ""}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "corporate_action",
                              index,
                              "price_range"
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("corporate_action", index)
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Earning Reports */}
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Earning Reports
                  </h3>
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
                {editFormData.earning_report &&
                  editFormData.earning_report.map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-800 p-4 rounded-lg mb-4"
                    >
                      <div className="grid gap-4">
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={item.company_name || ""}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "earning_report",
                              index,
                              "company_name"
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description || ""}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "earning_report",
                              index,
                              "description"
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                          <input
                          type="text"
                          placeholder="Tag"
                          value={item.tag || ""}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "earning_report",
                              index,
                              "tag"
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Price Range"
                          value={item.price_range || ""}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "earning_report",
                              index,
                              "price_range"
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("earning_report", index)
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Upcoming IPOs */}
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Upcoming IPOs
                  </h3>
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
                {editFormData.upcoming_ipos &&
                  editFormData.upcoming_ipos.map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-800 p-4 rounded-lg mb-4"
                    >
                      <div className="grid gap-4">
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={item.company_name || ""}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "upcoming_ipos",
                              index,
                              "company_name"
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <input
                          type="date"
                          placeholder="Dates"
                          value={item.dates || ""}
                          onChange={(e) =>
                            handleChange(e, "upcoming_ipos", index, "dates")
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Price Range"
                          value={item.price_range || ""}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "upcoming_ipos",
                              index,
                              "price_range"
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Lot Size"
                          value={item.lot_size || ""}
                          onChange={(e) =>
                            handleChange(e, "upcoming_ipos", index, "lot_size")
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Subscription"
                          value={item.subscription || ""}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "upcoming_ipos",
                              index,
                              "subscription"
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("upcoming_ipos", index)
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* FII/DII Activity */}
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    FII/DII Activity
                  </h3>
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
                {editFormData.fiidii_activity &&
                  editFormData.fiidii_activity.map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-800 p-4 rounded-lg mb-4"
                    >
                      <div className="grid gap-4">
                        <input
                          type="date"
                          placeholder="Current Date"
                          value={item.currentDate || ""}
                          onChange={(e) =>
                            handleChange(
                              e,
                              "fiidii_activity",
                              index,
                              "currentDate"
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <input
                          type="text"
                          placeholder="FII Net"
                          value={item.fiiNet || ""}
                          onChange={(e) =>
                            handleChange(e, "fiidii_activity", index, "fiiNet")
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <input
                          type="text"
                          placeholder="DII Net"
                          value={item.diiNet || ""}
                          onChange={(e) =>
                            handleChange(e, "fiidii_activity", index, "diiNet")
                          }
                          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("fiidii_activity", index)
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex justify-end pt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex items-center gap-2 bg-teal-500 hover:bg-teal-600
                           text-white px-4 py-2 rounded-lg transition-colors
                           ${isSaving ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 w-full max-w-md"
          >
            <div className="flex items-center mb-4 text-amber-500">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-semibold">Confirm Deletion</h2>
            </div>

            <p className="text-white mb-6">
              Are you sure you want to delete "{selectedItem?.title}"? This
              action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className={`flex items-center gap-2 bg-red-500 hover:bg-red-600
                         text-white px-4 py-2 rounded-lg transition-colors
                         ${isDeleting ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageData;
