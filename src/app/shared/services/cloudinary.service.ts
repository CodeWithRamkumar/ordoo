import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private apiUrl = 'http://localhost:3001/api';
  private chunkSize = 5 * 1024 * 1024; // 5MB chunks

  constructor(private http: HttpClient) {}

  uploadLargeFile(file: File): Observable<any> {
    if (file.size <= this.chunkSize) {
      return this.uploadSingleFile(file);
    }
    return this.uploadChunkedFile(file);
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/profile/setup`, profileData);
  }

  private uploadSingleFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  private uploadChunkedFile(file: File): Observable<any> {
    return new Observable(observer => {
      const totalChunks = Math.ceil(file.size / this.chunkSize);
      let uploadedChunks = 0;
      const uploadId = Date.now().toString();

      const uploadChunk = (chunkIndex: number) => {
        const start = chunkIndex * this.chunkSize;
        const end = Math.min(start + this.chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('uploadId', uploadId);
        formData.append('fileName', file.name);

        this.http.post(`${this.apiUrl}/upload-chunk`, formData).subscribe({
          next: (response) => {
            uploadedChunks++;
            const progress = (uploadedChunks / totalChunks) * 100;
            
            if (uploadedChunks === totalChunks) {
              observer.next({ type: HttpEventType.Response, body: response });
              observer.complete();
            } else {
              observer.next({ type: HttpEventType.UploadProgress, loaded: progress, total: 100 });
              uploadChunk(chunkIndex + 1);
            }
          },
          error: (error) => observer.error(error)
        });
      };

      uploadChunk(0);
    });
  }
}