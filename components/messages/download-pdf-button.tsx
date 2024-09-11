import "jspdf-autotable";
import html2pdf from "html2pdf.js";
import { marked } from "marked";
import LogoDark from "../../public/images/Logo_dark.png";

interface DownloadPDFButtonProps {
  json: any;
  text: string;
}

export default function DownloadPDFButton({
  json,
  text,
}: DownloadPDFButtonProps) {
  const downloadPDF = async () => {
    const title = json["30-Day Plan Title"] || "";
    const intention = json["Finalized What’s Next Intention"] || "";
    const actionSection = json["Action/Habit Stacking Statements"] || [];
    const obstaclesSection = json["Potential Obstacles & Strategies"] || [];
    const supportSection = json["Support System"] || [];

    // Prepare the HTML content
    let htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Monorama', sans-serif;
              margin: 0;
              padding: 0;
            }
            .header {
              background-color: white;
              text-align: center;
              font-size: 24px;
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
            }
            .header img {
              height: 60px;
              padding-top: 12px;
              margin-right: 20px;
            }
            .content {
              padding: 20px;
              font-size: 16px;
              line-height: 2;
            }
            .page-break {
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${LogoDark.src}" alt="Logo" />
            <span style="color: #916af5; font-weight: bold; font-size: 28px;">${title}</span>
          </div>
          <div class="content">
            <h2>Finalized What's Next Intention:</h2>
            <p>${intention}</p>
          </div>
    `;

    // Add the second page if the other sections exist
    if (
      actionSection.length > 0 ||
      obstaclesSection.length > 0 ||
      supportSection.length > 0
    ) {
      htmlContent += `
          <div class="page-break"></div>
          <div class="header">
            <img src="${LogoDark.src}" alt="Logo" />
            <span style="color: #916af5; font-weight: bold; font-size: 28px;">${title}</span>
          </div>
          <div class="content">
            ${
              actionSection.length > 0
                ? `<h2>Action/Habit Stacking Statements:</h2>${marked.parse(
                    actionSection
                      .map(
                        (item: any) =>
                          `- ${item["Action"]}\n  - Current habit: ${item["Identified Current Habit"]}\n  - Pairing: ${item["Pairing Action to Existing Habit Statement"]}`
                      )
                      .join("\n\n")
                  )}`
                : ""
            }
            ${
              obstaclesSection.length > 0
                ? `<h2>Potential Obstacles & Strategies:</h2>${marked.parse(
                    obstaclesSection
                      .map(
                        (item: any) =>
                          `- Obstacle: ${item["Obstacle"]}\n  - Strategy: ${item["Strategy"]}`
                      )
                      .join("\n\n")
                  )}`
                : ""
            }
            ${
              supportSection.length > 0
                ? `<h2>Support System:</h2>${marked.parse(
                    supportSection
                      .map(
                        (item: any) =>
                          `- ${item["Name"]}: ${item["How they can help"]}`
                      )
                      .join("\n")
                  )}`
                : ""
            }
          </div>
      `;
    }

    htmlContent += `
        </body>
      </html>
    `;

    // Configure PDF options
    const opt = {
      margin: 10,
      filename: "whats_next_intention.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Generate PDF
    const element = document.createElement("div");
    element.innerHTML = htmlContent;

    html2pdf().set(opt).from(element).save();
  };

  return (
    <button
      className="btn bg-green-500 text-white hover:bg-green-600"
      onClick={downloadPDF}
    >
      Download PDF
    </button>
  );
}
