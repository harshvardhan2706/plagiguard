package com.plagiguard.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

public class FileTextExtractor {
    private static final Logger logger = LoggerFactory.getLogger(FileTextExtractor.class);

    public static String extractText(File file) throws Exception {
        String name = file.getName().toLowerCase();
        String text;

        try {
            if (name.endsWith(".txt")) {
                text = new String(Files.readAllBytes(file.toPath()));
            } else if (name.endsWith(".pdf")) {
                try (PDDocument doc = PDDocument.load(file)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    text = stripper.getText(doc);
                }
            } else if (name.endsWith(".docx")) {
                text = extractFromDOCX(file);
            } else {
                throw new IllegalArgumentException("Unsupported file type: " + name);
            }

            if (text == null || text.trim().isEmpty()) {
                throw new Exception("No text content extracted from file");
            }

            return text.trim();
        } catch (Exception e) {
            logger.error("Error extracting text from file {}: {}", file.getName(), e.getMessage());
            throw e;
        }
    }

    public static String extractText(MultipartFile multipartFile) throws Exception {
        String name = multipartFile.getOriginalFilename().toLowerCase();
        String text;
        try (InputStream is = multipartFile.getInputStream()) {
            if (name.endsWith(".txt")) {
                text = new String(is.readAllBytes());
            } else if (name.endsWith(".pdf")) {
                try (PDDocument doc = PDDocument.load(is)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    text = stripper.getText(doc);
                }
            } else if (name.endsWith(".docx")) {
                text = extractFromDOCX(is);
            } else {
                throw new IllegalArgumentException("Unsupported file type: " + name);
            }
            if (text == null || text.trim().isEmpty()) {
                throw new Exception("No text content extracted from file");
            }
            return text.trim();
        } catch (Exception e) {
            logger.error("Error extracting text from MultipartFile {}: {}", name, e.getMessage());
            throw e;
        }
    }

    private static String extractFromDOCX(File file) throws Exception {
        try (FileInputStream fis = new FileInputStream(file);
             XWPFDocument document = new XWPFDocument(fis)) {
            
            List<String> paragraphs = new ArrayList<>();
            for (XWPFParagraph para : document.getParagraphs()) {
                String paraText = para.getText();
                if (paraText != null && !paraText.trim().isEmpty()) {
                    paragraphs.add(paraText.trim());
                }
            }
            
            if (paragraphs.isEmpty()) {
                throw new Exception("No text content found in DOCX file");
            }
            
            return String.join("\n", paragraphs);
        } catch (Exception e) {
            logger.error("Error extracting text from DOCX file {}: {}", file.getName(), e.getMessage());
            throw e;
        }
    }

    private static String extractFromDOCX(InputStream is) throws Exception {
        try (XWPFDocument document = new XWPFDocument(is)) {
            List<String> paragraphs = new ArrayList<>();
            for (XWPFParagraph para : document.getParagraphs()) {
                String paraText = para.getText();
                if (paraText != null && !paraText.trim().isEmpty()) {
                    paragraphs.add(paraText.trim());
                }
            }
            if (paragraphs.isEmpty()) {
                throw new Exception("No text content found in DOCX file");
            }
            return String.join("\n", paragraphs);
        } catch (Exception e) {
            logger.error("Error extracting text from DOCX InputStream: {}", e.getMessage());
            throw e;
        }
    }
}
