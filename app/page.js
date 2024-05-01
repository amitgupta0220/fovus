"use client";
export default function Home() {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("text", event.target.text.value); // Capture text input
    formData.append("file", event.target.file.files[0]);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    alert(result.message);
  };

  return (
    <div className="container">
      <h1 className="title">Upload Your File and Input Text</h1>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="text"
          name="text"
          placeholder="Enter some text"
          className="text-input"
        />
        <input type="file" name="file" id="file" className="file-input" />
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .title {
          color: #333;
          font-family: Arial, sans-serif;
        }
        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
          margin-top: 20px;
        }
        .file-input {
          font-size: 16px;
          padding: 8px;
        }
        .submit-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        .submit-button:hover {
          background-color: #0056b3;
        }
        .text-input {
          font-size: 16px;
          padding: 8px;
          width: 100%; // Ensures the text input spans the width of the form
        }
      `}</style>
    </div>
  );
}
