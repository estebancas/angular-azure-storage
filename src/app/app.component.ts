import { Component } from '@angular/core';
import { from, Observable } from 'rxjs';
import { combineAll, map } from 'rxjs/operators';
import { ISasToken } from './azure-storage/azureStorage';
import { BlobStorageService } from './azure-storage/blob-storage.service';
import { UploadEvent, UploadFile } from 'ngx-file-drop';

interface IUploadProgress {
  filename: string;
  progress: number;
}

@Component({
  selector: 'app-root',
  template: `
  <div style="text-align:center">
    <h1>
      Welcome to stottle-angular-blob-storage-upload
    </h1>
  </div>
  <input type="file" multiple="multiple" (change)="onFileChange($event)">

  <div *ngIf="filesSelected">
    <h2>Upload Progress</h2> 
    <pre>{{uploadProgress$ | async | json}}</pre>
  </div>

  <div class="center">
    <file-drop headertext="Drop files here" (onFileDrop)="dropped($event)" 
      (onFileOver)="fileOver($event)" (onFileLeave)="fileLeave($event)">
        <span>optional content (don't set headertext then)</span>
    </file-drop>
  </div>
  `,
  styles: []
})
export class AppComponent {
  uploadProgress$: Observable<IUploadProgress[]>;
  filesSelected = false;

  public files: UploadFile[] = [];

  constructor(private blobStorage: BlobStorageService) { }

  onFileChange(event: any): void {
    console.log(event)
    this.filesSelected = true;

    this.uploadProgress$ = from(event as FileList).pipe(
      map(file => this.uploadFile(file)),
      combineAll()
    );
  }

  uploadFile(file: File): Observable<IUploadProgress> {
    console.log('the file', file)
    const accessToken: ISasToken = {
      container: 'samplecontainer',
      filename: file.name,
      storageAccessToken:
        "sv=2017-11-09&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-08-09T12:11:56Z&st=2018-08-09T04:11:56Z&spr=https,http&sig=b%2ByMEh5FagVQ1COSOXV6dO9UQzM7fAzntAzF2VgL%2Fso%3D",
      storageUri: 'https://nfuztest.blob.core.windows.net'
    };

    return this.blobStorage
      .uploadToBlobStorage(accessToken, file)
      .pipe(map(progress => this.mapProgress(file, progress)));
  }

  private mapProgress(file: File, progress: number): IUploadProgress {
    return {
      filename: file.name,
      progress: progress
    };
  }

  public dropped(event: any) {
    this.files = event.files

    console.log(event)
    console.log(this.files)
    for (const droppedFile of event.files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry

        fileEntry.file((file: File) => {
          console.log('droped', droppedFile.relativePath, file)
          this.onFileChange([file])
        });
      } else {
        const fileEntry = droppedFile.fileEntry
        console.log(droppedFile.relativePath, fileEntry)
      }
    }
  }

  public fileOver(event) {
    console.log('file over', event);
  }

  public fileLeave(event) {
    console.log('file leave', event);
  }
}
