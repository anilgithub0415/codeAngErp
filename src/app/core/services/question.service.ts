
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import catchError and tap

// Import the User interfaces/DTOs you just defined
import { Question, CreateQuestionDto, UpdateQuestionDto, Optionofquestion } from '../models/question.model';


@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private apiUrl = '/question';

  constructor(private http: HttpClient) { }

  /**
   * Handles HTTP errors from API calls.
   * @param error The HttpErrorResponse.
   * @returns An Observable that throws an error.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
      let errorMessage = 'An unknown error occurred!';
      if (error.error instanceof ErrorEvent) {
          // Client-side or network error occurred.
          console.error('Client-side error:', error.error.message);
          errorMessage = `Network error: ${error.error.message}`;
      } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong.
          console.error(
              `Backend returned code ${error.status}, ` +
              `body was: ${JSON.stringify(error.error)}`);
          errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
      }
      // Return an observable with a user-facing error message.
      return throwError(() => new Error(errorMessage));
  }

  /**
   * Creates a new Question. The `CreateQuestionDto` ensures we are sending the correct data.
   * @param questionDto The data for the new question.
   * @returns An Observable of the created Question.
   */
  createQuestion(questionDto: CreateQuestionDto): Observable<Question> {
    return this.http.post<Question>(this.apiUrl, questionDto).pipe(
      tap(newQuestion => console.log('Created question:', newQuestion)),
      catchError(this.handleError)
    );
  }

  mergeQuestionToTenant(sourceQuestionId: number, targetTenantId: string): Observable<Question> {
    alert('yes need to merge......qid:'+sourceQuestionId+' for tid:'+targetTenantId)
    const url = `${this.apiUrl}/merge/${sourceQuestionId+'/'+targetTenantId}`; alert('url hitting for q merge is '+url);
    
    return this.http.post<Question>(url, {}).pipe(
      tap(mergeedQuestion => console.log('Updated question:', mergeedQuestion)),
      catchError(this.handleError)
    )
    
  }

  /**
   * Updates an existing Question. The `UpdateQuestionDto` allows for partial updates.
   * @param id The ID of the question to update.
   * @param questionDto The partial data for the question.
   * @returns An Observable of the updated Question.
   */
  updateQuestion(id: number, questionDto: UpdateQuestionDto): Observable<Question> {
    const url = `${this.apiUrl}/${id}`; alert('url hitting for q edit:'+url);
    
    return this.http.put<Question>(url, questionDto).pipe(
      tap(updatedQuestion => console.log('Updated question:', updatedQuestion)),
      catchError(this.handleError)
    );
  }
  deleteQuestion(id: number ): Observable<Question> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Question>(url).pipe(
      tap(deletedQuestion => console.log('Deleted question:',deletedQuestion)),
      catchError(this.handleError)
    );
  }

  /**
   * Fetches a list of all users from the backend.
   * In a multi-tenant application, this should eventually be filtered by the current tenant.
   * @returns An Observable of an array of User objects.
   */
  getQuestions(ptenanId:string): Observable<Question[]> {
    console.log('getQuestion url:',this.apiUrl);
    
      var url=this.apiUrl+'?activeTenantId='+ptenanId;
            return this.http.get<Question[]>(url).pipe(
       //   tap(users => console.log('Fetched questions:', questions)),
          catchError(this.handleError)
      );
  }

  
  getQuestion(questionid:number): Observable<Question> {
    console.log('getQuestion url:',this.apiUrl);
    
      var url=this.apiUrl+'/'+questionid;
            return this.http.get<Question>(url).pipe(
       //   tap(users => console.log('Fetched questions:', questions)),
          catchError(this.handleError)
      );
  }

  getOptionsByQuestion(questionid:number,ptenanId:string): Observable<Optionofquestion[]> {
  
    
      var url=this.apiUrl+'/options/'+questionid+'?activeTenantId='+ptenanId;
      console.log('.......url trying:',url);
            return this.http.get<Optionofquestion[]>(url).pipe(
       //   tap(users => console.log('Fetched questions:', questions)),
          catchError(this.handleError)
      );
  }
}
