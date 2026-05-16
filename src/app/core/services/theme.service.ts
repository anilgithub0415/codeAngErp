
// theme.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable,catchError, map, of} from 'rxjs'
import { style } from '@angular/animations';
//import {} from '../../../../src/themes/'

@Injectable({
  providedIn: 'root'
})

export class ThemeService {
  constructor(private httpClient:HttpClient){}
	private currentTheme: string | null = 'light-theme';

  

	loadTheme(themeName: string) {
	
					if (this.currentTheme) {
						
					this.removeThemeCSS(this.currentTheme);
					
								}


						const head = document.getElementsByTagName('head')[0];

						const themeLink = document.createElement('link');

						themeLink.rel = 'stylesheet';
					
						themeLink.href = `${themeName}.css`; console.log();
						

					
						head.appendChild(themeLink);
						//console.log(head);console.log(themeLink);
						var fileexists=this.fileExists('../../../themes/theme-dark.scss')
						console.log('filexists:',fileexists);
						
					
						this.currentTheme = themeName;
						localStorage.setItem('app-theme', themeName);
	}



	removeThemeCSS(themeName: string) {

		const existingLink = document.querySelector(`link[href="${themeName}.css"]`);
	
		if (existingLink) {
      
			document.head.removeChild(existingLink);
    
			}
  
	}

	loadInitialTheme() {
		const savedTheme = localStorage.getItem('app-theme');
		if (savedTheme) {
		  this.loadTheme(savedTheme);
		} else {
		  this.loadTheme(this.currentTheme?this.currentTheme:'light-theme'); // Apply default if no saved theme
		}
	  }
	
	getCurrentTheme(): string | null {
    
		return this.currentTheme;
  
	}


	// public fileExists(url: string): Observable<boolean> {
	// 	return this.httpClient.get(url).pipe(map(() => true), catchError(() => of(false)));
	// }
	fileExists(url: string): Observable<boolean> { // alert('searching file:'+url)
		return this.httpClient.get('../../../themes/theme-dark.scss')
			.pipe(
				map(response => {
					alert('found file')
					return true;
				}),
				catchError(error => {
					alert('not found file')
					return of(false);
				})
			);
	}



	loadStyle(styleName: string){//} = 'light-theme' | 'dark-theme') {
		
		const head = document.getElementsByTagName('head')[0];
	  
		let themeLink = document.getElementById('client-theme') as HTMLLinkElement;
	  
		if (themeLink) {alert('styleName:'+styleName)
		  themeLink.href = styleName;
		} else {
		  const style = document.createElement('link');
		  style.id = 'client-theme';
		  style.rel = 'stylesheet';
		  style.href = `${styleName}`;
	  
		  head.appendChild(style);
		}
	  }
}

