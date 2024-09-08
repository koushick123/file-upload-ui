import { Component, OnInit } from '@angular/core';
import { HttpEventType, HttpResponse , HttpErrorResponse } from '@angular/common/http';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { FileInfo } from 'src/app/domain/fileinfo';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.css']
})
export class UploadFilesComponent implements OnInit {
  selectedFiles?: FileList;
  progressInfos: any[] = [];
  message: string[] = [];

  //fileInfos?: Observable<any>;
  fileInfos: FileInfo[] = [];
  fileEmpty: boolean = false;

  constructor(private uploadService: FileUploadService) { }

  ngOnInit(): void {
    //this.fileInfos = this.uploadService.getFiles();
	this.getFiles();
  }

  selectFiles(event: any): void {
    this.message = [];
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
  }

  upload(idx: number, file: File): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    if (file) {
      this.uploadService.upload(file).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            const msg = file.name + ": Successful!";
            this.message.push(msg);
			this.getFiles();
          }
        },
        error: (err: any) => {
          this.progressInfos[idx].value = 0;
          let msg = file.name + ": Failed!";

          if (err.error && err.error.message) {
            msg += " " + err.error.message;
          }
		  this.getFiles();
          this.message.push(msg);
        }
      });
    }
  }
  
  getFiles(): void {
	this.uploadService.getFiles().subscribe({
		next: (fileData: FileInfo[]) => {
			this.fileInfos = fileData;
			this.fileEmpty = false;
		},
		error: (err: HttpErrorResponse) => {
			console.log(err.message);
			this.fileEmpty = true;
		}
	});
  }

  uploadFiles(): void {
    this.message = [];

    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(i, this.selectedFiles[i]);
      }
    }
  }
}
