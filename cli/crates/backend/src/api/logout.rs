use super::{consts::CREDENTIALS_FILE, errors::ApiError};
use common::environment::get_user_dot_grafbase_path;
use std::fs;

/// Deletes the login credentials file
///
/// # Errors
///
/// - returns [`BackendError::NotLoggedIn`] if the user is not logged in when attempting to log out
///
/// - returns [`BackendError::DeleteCredentialsFile`] if ~/.grafbase could not be created
///
/// - returns [`BackendError::ReadCredentialsFile`] if ~/.grafbase could not be read
pub fn logout() -> Result<(), ApiError> {
    let user_dot_grafbase_path = get_user_dot_grafbase_path().ok_or(ApiError::NotLoggedIn)?;

    let credentials_path = user_dot_grafbase_path.join(CREDENTIALS_FILE);

    match credentials_path.try_exists() {
        Ok(true) => fs::remove_file(credentials_path).map_err(ApiError::DeleteCredentialsFile),
        Ok(false) => Err(ApiError::NotLoggedIn),
        Err(error) => Err(ApiError::ReadCredentialsFile(error)),
    }
}