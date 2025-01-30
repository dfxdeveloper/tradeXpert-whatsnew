import React, { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactQuill from "react-quill";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
  ToastContainer,
} from "./toastmessage";
import "react-quill/dist/quill.snow.css";
import { Link } from "react-router-dom";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div
          className="fixed inset-0 bg-black/80 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-xl bg-slate-900 p-6 text-left shadow-xl transition-all border border-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
};

const ManageData = () => {
  const initialFormData = {
    title: "",
    description: "",
    news: [{ title: "", description: "", pubDate: "" }],
    corporate_action: [{ title: "", description: "", type: "Dividend" }],
    earning_report: [{ title: "", description: "", type: "Result" }],
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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [data, setData] = useState([]);
  const [editFormData, setEditFormData] = useState(initialFormData);

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setTableLoading(true);
    try {
      const response = await axios.get(
        "https://stage.api.tradexpert.ai/api/v1/user/whatsnew"
      );
      console.log(response.data.whatsnew, "response");
      setData(response.data.whatsnew);
    } catch (error) {
      toast.error("Failed to fetch data");
      console.error("Error fetching data:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    try {
      const match = dateString.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (match) {
        const [, day, month, year] = match;
        return `${year}-${month}-${day}`;
      }

      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
    } catch (error) {
      console.error("Error formatting date:", error);
    }

    return "";
  };

  const handleEdit = (item) => {
    const formattedItem = {
      ...item,
      news: item.news.map((newsItem) => ({
        ...newsItem,
        pubDate: formatDateForInput(newsItem.pubDate),
      })),
    };

    setSelectedItem(item);
    setEditFormData({
      _id: item._id,
      ...formattedItem,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async () => {
    setLoading(true);
    const loadingToast = showLoadingToast("Updating data...");

    try {
      await axios.put(
        `https://stage.api.tradexpert.ai/api/v1/admin/whatsnew/${selectedItem._id}`,
        editFormData
      );
      toast.dismiss(loadingToast);
      showSuccessToast("Data updated successfully");
      await fetchData();
      setIsEditModalOpen(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      showErrorToast("Failed to update data");
      console.error("Error updating data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    const loadingToast = showLoadingToast("Deleting data...");
    try {
      await axios.delete(
        `https://stage.api.tradexpert.ai/api/v1/admin/whatsnew/${selectedItem._id}`
      );
      toast.dismiss(loadingToast);
      showSuccessToast("Data deleted successfully");
      await fetchData();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      showErrorToast("Failed to delete data");
      console.error("Error deleting data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, arrayName, index, field) => {
    if (arrayName) {
      const updatedArray = [...editFormData[arrayName]];
      if (field === "pubDate") {
        const inputDate = e.target.value;
        if (inputDate) {
          const [year, month, day] = inputDate.split("-");
          updatedArray[index][field] = `${day}-${month}-${year}`;
        } else {
          updatedArray[index][field] = "";
        }
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

  const getInputDateValue = (pubDate) => {
    if (!pubDate) return "";
    // Convert DD-MM-YYYY to YYYY-MM-DD for input
    const [day, month, year] = pubDate.split("-");
    return `${year}-${month}-${day}`;
  };

  const handleEditorChange = (content, field) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: content,
    }));
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

  if (tableLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading Data...</span>
        </div>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-4">
            <Sparkles className="w-8 h-8 text-teal-500" />
            Manage What's New
            <Sparkles className="w-8 h-8 text-teal-500" />
          </h1>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="py-4 px-6 text-left text-slate-300">Title</th>
                <th className="py-4 px-6 text-right text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {Array.isArray(data) &&
                  data.map((item) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <td className="py-4 px-6 text-white">{item.title}</td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-teal-500"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 rounded-lg bg-slate-700 hover:bg-red-900/50 text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <div className="max-h-[80vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Edit What's New
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={editFormData.description}
                    onChange={(content) =>
                      handleEditorChange(content, "description")
                    }
                    modules={modules}
                    formats={formats}
                    className="bg-slate-800 text-white"
                  />
                </div>
              </div>

              {/* News Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-white">News</h4>
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
                {editFormData.news.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-900 p-4 rounded-lg space-y-4"
                  >
                    <input
                      type="text"
                      placeholder="Title"
                      value={item.title}
                      onChange={(e) => handleChange(e, "news", index, "title")}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        handleChange(e, "news", index, "description")
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <input
                      type="date"
                      name="pubDate"
                      value={getInputDateValue(item.pubDate) || ""}
                      onChange={(e) =>
                        handleChange(e, "news", index, "pubDate")
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem("news", index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Corporate Actions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-white">
                    Corporate Actions
                  </h4>
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
                {editFormData.corporate_action.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-900 p-4 rounded-lg space-y-4"
                  >
                    <input
                      type="text"
                      placeholder="Title"
                      value={item.title}
                      onChange={(e) =>
                        handleChange(e, "corporate_action", index, "title")
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        handleChange(
                          e,
                          "corporate_action",
                          index,
                          "description"
                        )
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <select
                      value={item.type}
                      onChange={(e) =>
                        handleChange(e, "corporate_action", index, "type")
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
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
                ))}
              </div>

              {/* Earning Reports */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-white">
                    Earning Reports
                  </h4>
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
                {editFormData.earning_report.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-900 p-4 rounded-lg space-y-4"
                  >
                    <input
                      type="text"
                      placeholder="Title"
                      value={item.title}
                      onChange={(e) =>
                        handleChange(e, "earning_report", index, "title")
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        handleChange(e, "earning_report", index, "description")
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <select
                      value={item.type}
                      onChange={(e) =>
                        handleChange(e, "earning_report", index, "type")
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
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
                ))}
              </div>

              {/* Upcoming IPOs */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-white">
                    Upcoming IPOs
                  </h4>
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
                {editFormData.upcoming_ipos.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-900 p-4 rounded-lg space-y-4"
                  >
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={item.company_name}
                      onChange={(e) =>
                        handleChange(e, "upcoming_ipos", index, "company_name")
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Dates"
                      value={item.dates}
                      onChange={(e) =>
                        handleChange(e, "upcoming_ipos", index, "dates")
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Price Range"
                      value={item.price_range}
                      onChange={(e) =>
                        handleChange(e, "upcoming_ipos", index, "price_range")
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Lot Size"
                      value={item.lot_size}
                      onChange={(e) =>
                        handleChange(e, "upcoming_ipos", index, "lot_size")
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Subscription"
                      value={item.subscription}
                      onChange={(e) =>
                        handleChange(e, "upcoming_ipos", index, "subscription")
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem("upcoming_ipos", index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Rich Text Editor Fields */}
              <div className="space-y-6">
                {/* Today's Learning */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Today's Learning
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={editFormData.todays_learning}
                    onChange={(content) =>
                      handleEditorChange(content, "todays_learning")
                    }
                    modules={modules}
                    formats={formats}
                    className="bg-slate-800 text-white h-64 mb-12"
                  />
                </div>

                {/* Risk Management */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Risk Management
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={editFormData.risk_management}
                    onChange={(content) =>
                      handleEditorChange(content, "risk_management")
                    }
                    modules={modules}
                    formats={formats}
                    className="bg-slate-800 text-white h-64 mb-12"
                  />
                </div>

                {/* Trading Strategy */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Trading Strategy
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={editFormData.trading_strategy}
                    onChange={(content) =>
                      handleEditorChange(content, "trading_strategy")
                    }
                    modules={modules}
                    formats={formats}
                    className="bg-slate-800 text-white h-64 mb-12"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-semibold text-white">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-slate-300">
              Are you sure you want to delete this content? This action cannot
              be undone.
            </p>

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-700">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
export default ManageData;
