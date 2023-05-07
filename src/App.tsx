import React, { useState } from "react";
import { useDropzone } from "react-dropzone"; // ファイルのドラッグアンドドロッププラグイン ( https://github.com/react-dropzone/react-dropzone )
import imageCompression from "browser-image-compression"; // 画像圧縮プラグイン ( https://github.com/Donaldcwl/browser-image-compression )
import JSZip from "jszip"; // zipファイルにまとめるプラグイン ( https://github.com/Stuk/jszip )
import { saveAs } from "file-saver"; // クライアントサイドで生成したファイルをダウンロードさせるプラグイン (https://github.com/eligrey/FileSaver.js)
import "./styles/App.scss";

export const App = () => {
  const [files, setFiles] = useState<File[]>([]);

  // エラーメッセージの設定
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // エラーメッセージの設定（最大数超過）
  const [errorMaxOveressage, setErrorMaxOveressage] = useState<string | null>(
    null
  );

  // 最大ファイル数
  const MAX_FILES = 20;

  // 圧縮の設定
  const compressOption = {
    initialQuality: 0.6,
    preserveExif: false,
  };

  // ファイルドロップが許可されてるタイプ
  const allowedFileTypes = ["image/png", "image/jpeg", "image/webp"];

  // 画像のドロップ時に実行される関数
  const handleDrop = async (acceptedFiles: File[]) => {
    setErrorMessage(null);

    // 許可されてないファイルの設定
    const invalidFiles = acceptedFiles.filter(
      (file) => !allowedFileTypes.includes(file.type)
    );

    // 許可されてないファイル有無チェック
    if (invalidFiles.length > 0) {
      const invalidFileNames = invalidFiles.map((file) => file.name).join(", ");
      setErrorMessage(
        `次のファイルは許可されたファイルではないため、圧縮ファイルが生成できません : ${invalidFileNames}`
      );
      // ファイル数超過チェック
      if (acceptedFiles.length > MAX_FILES) {
        setErrorMaxOveressage(
          `最大ファイル数である${MAX_FILES}個を超えているため、圧縮ファイルを生成できません`
        );
      }
      return;
    }

    // ファイル数超過チェック
    if (acceptedFiles.length > MAX_FILES) {
      setErrorMaxOveressage(
        `最大ファイル数である${MAX_FILES}個を超えているため、圧縮ファイルを生成できません`
      );
      return;
    } else {
      const compressedFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          const compressed = await imageCompression(file, compressOption);
          return compressed;
        })
      );

      setErrorMaxOveressage(null);

      setFiles(compressedFiles);
    }
  };

  // ダウンロードボタンクリック時に実行される関数
  const handleDownload = () => {
    const zip = new JSZip();
    files.forEach((file, index) => {
      zip.file(`${file.name}`, file);
    });
    zip.generateAsync({ type: "blob" }).then((blob) => {
      saveAs(blob, "compressed_images.zip");
    });
  };

  // ファイルドロップ用のコンポーネント
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
  });

  return (
    <>
      <div className="file_input">
        <h1 className="c-heading c-heading-large">画像圧縮ツール</h1>
        <p>
          最大{MAX_FILES}
          個まで同時に画像圧縮ができます。利用できるファイルは「PNG」「JPG」「WEBP」です。
        </p>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <div className="file_input--dragable">
              ここにファイルをドロップしてください ...
            </div>
          ) : (
            <div className="file_input--dragable">
              ここにファイルをドラッグアンドドロップするか、ここをクリックしてファイルを選択してください。
            </div>
          )}
        </div>
        {errorMessage && <p className="c-error_text">{errorMessage}</p>}
        {errorMaxOveressage && (
          <p className="c-error_text">{errorMaxOveressage}</p>
        )}
      </div>
      {files.length > 0 && !errorMessage && !errorMaxOveressage && (
        <div className="file_output">
          <h2 className="c-heading c-heading-medium">圧縮画像ファイル</h2>
          <ol>
            {files.map((file, index) => (
              <li key={index}>{`${file.name}`}</li>
            ))}
          </ol>
          <button className="c-btn_cta" onClick={handleDownload}>
            zipファイルとしてダウンロード
          </button>
        </div>
      )}
    </>
  );
};
