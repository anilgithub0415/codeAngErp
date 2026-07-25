export enum FormOpMode {
  None = 'NONE',          // Resting state / Initializing
  Loading = 'LOADING',    // Fetching data from API
  View = 'VIEW',          // Read-only / Detail mode
  Add = 'ADD',            // Creating a new record
  Update = 'UPDATE',      // Editing an existing record
  Error = 'ERROR'  ,       // Failed to load or save data
  PortalNegotiation = "PortalNegotiation"
}