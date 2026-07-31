<template>
  <div class="login-logo">
    <div class="logo-container">
      <div class="logo-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#1e88e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="5" r="3"></circle>
          <circle cx="5" cy="19" r="3"></circle>
          <circle cx="19" cy="19" r="3"></circle>
          <line x1="12" y1="8" x2="5" y2="16"></line>
          <line x1="12" y1="8" x2="19" y2="16"></line>
        </svg>
      </div>
      <h1 class="logo-text">SoftLink</h1>
      <p class="logo-subtitle">软件工程资源平台</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginLogo'
}
</script>

<style scoped>
.login-logo {
  margin-bottom: 40px;
  text-align: center;

  .logo-container {
    .logo-icon {
      margin-bottom: 10px;
    }

    .logo-text {
      font-size: 32px;
      font-weight: bold;
      color: #fff;
      margin: 0 0 5px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .logo-subtitle {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
    }
  }
}
</style>
