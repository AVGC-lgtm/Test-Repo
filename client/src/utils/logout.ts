export function logout() {
  // Remove token from localStorage
  localStorage.removeItem('token');

  // Redirect to signin page
  window.location.href = '/auth/signin';
}
