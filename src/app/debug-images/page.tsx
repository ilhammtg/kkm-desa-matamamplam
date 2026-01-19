import { readdir } from "fs/promises";
import { join } from "path";
import { cwd } from "process";
import Link from "next/link";

export default async function DebugImagesPage() {
  const uploadDir = join(cwd(), "public", "uploads");
  let files: string[] = [];
  
  try {
    files = await readdir(uploadDir);
  } catch (e) {
    console.error(e);
    return <div>Error reading uploads dir: {String(e)}</div>;
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Debug Images</h1>
      <p className="mb-4">Upload Directory: {uploadDir}</p>
      
      {files.length === 0 ? (
        <p>No files found.</p>
      ) : (
        <ul className="space-y-4">
          {files.map((file) => (
            <li key={file} className="border p-4 rounded">
              <p className="font-mono mb-2">{file}</p>
              <a href={`/uploads/${file}`} target="_blank" className="text-blue-500 hover:underline block mb-2">
                Open /uploads/{file}
              </a>
              <img src={`/uploads/${file}`} alt={file} className="max-w-[200px] border shadow" />
            </li>
          ))}
        </ul>
      )}
      
      <div className="mt-8">
          <Link href="/about" className="text-blue-600 underline">Back to About</Link>
      </div>
    </div>
  );
}
