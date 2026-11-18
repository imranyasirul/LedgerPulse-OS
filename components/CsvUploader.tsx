"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload, Download, AlertCircle } from "lucide-react";
import ColumnMapperModal from "@/components/ColumnMapperModal";
import { SalesRecord } from "@/types/analytics";

interface CsvUploaderProps {
  onDataLoaded: (records: SalesRecord[]) => void;
}

interface PendingImport {
  fileName: string;
  headers: string[];
  rawRows: Record<string, unknown>[];
}

export default function CsvUploader({ onDataLoaded }: CsvUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const fileName = file.name;
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
            defval: "",
          });

          if (rows.length === 0) {
            setError("The uploaded Excel sheet is empty.");
            return;
          }

          const headers = Object.keys(rows[0]);
          setPendingImport({ fileName, headers, rawRows: rows });
        } catch {
          setError("Failed to parse Excel file. Ensure it is a valid .xlsx or .xls file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            setError("The uploaded CSV file contains no rows.");
            return;
          }
          const headers = results.meta.fields || Object.keys(results.data[0]);
          setPendingImport({ fileName, headers, rawRows: results.data });
        },
        error: () => {
          setError("Error reading CSV file. Please check the file encoding.");
        },
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadMessySample = () => {
    const rawPosCsv = [
      "Order_Date,Outlet_Branch,Item_Title,Dept,Gross_Sales_USD,COGS_USD",
      "2026-11-10,Dhaka Flagship,Jordan 1 Retro High,Footwear,\"$3,200.00\",\"$1,850.00\"",
      "2026-11-11,Online Store,Oversized Fleece Hoodie,Apparel,\"$1,750.00\",\"$950.00\"",
      "2026-11-12,Online Store,Smart Watch Ultra,Gadgets,\"$2,400.00\",\"$1,300.00\"",
      "2026-11-13,Dhaka Flagship,Cargo Tech Pants,Apparel,\"$1,580.00\",\"$890.00\"",
      "2026-11-14,Online Store,ANC Studio Headphones,Gadgets,\"$2,100.00\",\"$1,150.00\"",
      "2026-11-15,Dhaka Flagship,Crossbody Tech Bag,Accessories,\"$920.00\",\"$490.00\"",
    ].join("\n");

    const blob = new Blob([rawPosCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "raw-pos-export-sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-col items-start sm:items-end gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadMessySample}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Sample POS File
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Import CSV / Excel
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {error && (
          <p className="inline-flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}
      </div>

      {pendingImport && (
        <ColumnMapperModal
          fileName={pendingImport.fileName}
          headers={pendingImport.headers}
          rawRows={pendingImport.rawRows}
          onConfirm={(mappedRecords) => {
            onDataLoaded(mappedRecords);
            setPendingImport(null);
          }}
          onClose={() => setPendingImport(null)}
        />
      )}
    </>
  );
}