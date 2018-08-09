import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BLOB_STORAGE_TOKEN, IBlobStorage } from './azure-storage/azureStorage';
import { BlobStorageService } from './azure-storage/blob-storage.service';
import { BlobModule } from 'angular-azure-blob-service';
import { FileDropModule } from 'ngx-file-drop';

export function azureBlobStorageFactory(): IBlobStorage {
  return window['AzureStorage'].Blob;
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    BlobModule.forRoot(),
    FileDropModule
  ],
  providers: [
    BlobStorageService,
    {
      provide: BLOB_STORAGE_TOKEN,
      useFactory: azureBlobStorageFactory
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
