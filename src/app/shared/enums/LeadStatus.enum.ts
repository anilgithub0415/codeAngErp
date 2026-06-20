export enum LeadStatus {
  NewLead = 'NewLead',          // Resting state / Initializing
  ContatctPending = 'ContatctPending',    // Fetching data from API
  RequirementDiscussion = 'RequirementDiscussion',          // Read-only / Detail mode
  QuotationSent = 'QuotationSent',            // Creating a new record
  FollowupPending = 'FollowupPending',      // Editing an existing record
  Converted = 'Converted',         // Failed to load or save data
  LostLead ='LostLead'
}