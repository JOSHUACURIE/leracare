// src/components/patient/FeedbackForm.jsx
import { useState } from "react";
import API from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function FeedbackForm() {
  const [category, setCategory] = useState("complaint");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      await API.post("/complaints", { category, message });
      setSuccess("✅ Thank you for your feedback!");
      setMessage("");
      setCategory("complaint");
    } catch (err) {
      console.error("Error submitting feedback", err);
      setError("❌ Failed to send feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card header="Complaints & Suggestions">
      <form onSubmit={handleSubmit} className="feedback-form space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg p-2 mt-1"
          >
            <option value="complaint">Complaint</option>
            <option value="suggestion">Suggestion</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full border rounded-lg p-2 mt-1"
            placeholder="Write your complaint or suggestion..."
            required
          />
        </div>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>

        {success && <p className="text-green-600 mt-2">{success}</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
    </Card>
  );
}
