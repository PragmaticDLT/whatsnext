"use client";

import React from "react";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

interface DownloadPDFButtonProps {
  json: any;
  text: string;
}

async function createPDF(json: any) {
  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Cargar la fuente Monorama
    const fontResponse = await fetch("/Monorama-Regular.ttf");
    if (!fontResponse.ok) {
      throw new Error(`HTTP error! status: ${fontResponse.status}`);
    }
    const fontBytes = await fontResponse.arrayBuffer();
    const monoramaFont = await pdfDoc.embedFont(fontBytes);

    // Cargar la imagen del logo
    const logoResponse = await fetch("/images/Logo_dark.png");
    if (!logoResponse.ok) {
      throw new Error(`HTTP error! status: ${logoResponse.status}`);
    }
    const logoImageBytes = await logoResponse.arrayBuffer();
    const logoImage = await pdfDoc.embedPng(logoImageBytes);

    const title = json["30-Day Plan Title"] || "";
    const intention = json["Finalized What’s Next Intention"] || "";
    const actionSection = json["Action/Habit Stacking Statements"] || [];
    const obstaclesSection = json["Potential Obstacles & Strategies"] || [];
    const supportSection = json["Support System"] || [];

    // Función auxiliar para dividir el texto en líneas
    const splitTextIntoLines = (
      text: string,
      maxWidth: number,
      fontSize: number
    ) => {
      const words = text.split(" ");
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const width = monoramaFont.widthOfTextAtSize(
          currentLine + " " + words[i],
          fontSize
        );
        if (width < maxWidth) {
          currentLine += " " + words[i];
        } else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }
      lines.push(currentLine);
      return lines;
    };

    // First page
    const page1 = pdfDoc.addPage();
    const { width, height } = page1.getSize();
    const maxWidth = width - 100;

    const logoWidth = 100;
    const logoHeight = logoImage.height * (logoWidth / logoImage.width);
    page1.drawImage(logoImage, {
      x: 50,
      y: height - 20 - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });

    page1.drawText(title, {
      x: 50 + logoWidth + 30,
      y: height - 45,
      size: 24,
      font: monoramaFont,
      color: rgb(0.57, 0.42, 0.96),
    });

    page1.drawText("Finalized What's Next Intention:", {
      x: 50,
      y: height - 70 - logoHeight,
      size: 18,
      font: monoramaFont,
    });

    const intentionLines = splitTextIntoLines(intention, maxWidth, 12);
    let yPosition = height - 100 - logoHeight;
    intentionLines.forEach((line) => {
      page1.drawText(line, {
        x: 50,
        y: yPosition,
        size: 12,
        font: monoramaFont,
      });
      yPosition -= 20;
    });

    // Second page
    const page2 = pdfDoc.addPage();
    yPosition = height - 45;

    page2.drawImage(logoImage, {
      x: 50,
      y: height - 20 - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });

    page2.drawText(title, {
      x: 50 + logoWidth + 30,
      y: yPosition,
      size: 24,
      font: monoramaFont,
      color: rgb(0.57, 0.42, 0.96),
    });

    yPosition -= 45;

    if (actionSection.length > 0) {
      page2.drawText("Action/Habit Stacking Statements:", {
        x: 50,
        y: yPosition,
        size: 18,
        font: monoramaFont,
      });
      yPosition -= 30;

      for (const item of actionSection) {
        const actionLines = splitTextIntoLines(
          `- ${item["Action"]}`,
          maxWidth,
          12
        );
        actionLines.forEach((line) => {
          page2.drawText(line, {
            x: 50,
            y: yPosition,
            size: 12,
            font: monoramaFont,
          });
          yPosition -= 20;
        });

        const currentHabitLines = splitTextIntoLines(
          `  Current habit: ${item["Identified Current Habit"]}`,
          maxWidth,
          12
        );
        currentHabitLines.forEach((line) => {
          page2.drawText(line, {
            x: 50,
            y: yPosition,
            size: 12,
            font: monoramaFont,
          });
          yPosition -= 20;
        });

        const pairingLines = splitTextIntoLines(
          `  Pairing: ${item["Pairing Action to Existing Habit Statement"]}`,
          maxWidth,
          12
        );
        pairingLines.forEach((line) => {
          page2.drawText(line, {
            x: 50,
            y: yPosition,
            size: 12,
            font: monoramaFont,
          });
          yPosition -= 20;
        });

        yPosition -= 30;
      }
    }

    if (obstaclesSection.length > 0) {
      page2.drawText("Potential Obstacles & Strategies:", {
        x: 50,
        y: yPosition,
        size: 18,
        font: monoramaFont,
      });
      yPosition -= 30;

      for (const item of obstaclesSection) {
        const obstacleLines = splitTextIntoLines(
          `Obstacle: ${item["Obstacle"]}`,
          maxWidth,
          12
        );
        obstacleLines.forEach((line) => {
          page2.drawText(line, {
            x: 50,
            y: yPosition,
            size: 12,
            font: monoramaFont,
          });
          yPosition -= 20;
        });

        const strategyLines = splitTextIntoLines(
          `Strategy: ${item["Strategy"]}`,
          maxWidth,
          12
        );
        strategyLines.forEach((line) => {
          page2.drawText(line, {
            x: 50,
            y: yPosition,
            size: 12,
            font: monoramaFont,
          });
          yPosition -= 20;
        });

        yPosition -= 30;
      }
    }

    if (supportSection.length > 0) {
      page2.drawText("Support System:", {
        x: 50,
        y: yPosition,
        size: 18,
        font: monoramaFont,
      });
      yPosition -= 30;

      for (const item of supportSection) {
        const supportLines = splitTextIntoLines(
          `- ${item["Name"]}: ${item["How they can help"]}`,
          maxWidth,
          12
        );
        supportLines.forEach((line) => {
          page2.drawText(line, {
            x: 50,
            y: yPosition,
            size: 12,
            font: monoramaFont,
          });
          yPosition -= 20;
        });
      }
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error("Error creating PDF:", error);
    throw error;
  }
}

export default function DownloadPDFButton({
  json,
  text,
}: DownloadPDFButtonProps) {
  const handleDownload = async () => {
    const pdfBytes = await createPDF(json);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "whats_next_intention.pdf";
    link.click();
  };

  return (
    <button
      className="btn bg-green-500 text-white hover:bg-green-600"
      onClick={handleDownload}
    >
      Download PDF
    </button>
  );
}
