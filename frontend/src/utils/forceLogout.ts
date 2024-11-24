import { Router } from "vue-router";

export function forceLogout(status: number, router: Router) {
  let message;
  if (status == 400) {
    message =
      "Возникла проблема с потверждением вашей сессии, попробуйте перезайти в аккаунт";
    localStorage.removeItem("jwtToken");
    router.push("/");
  } else if (status == 403) {
    message = "Истекло время вашей сессии, зайдите в свой акканут заново";
    localStorage.removeItem("jwtToken");
    router.push("/");
  } else {
    message =
      "Возникла непредвиденная ошибка на сервере. Операция не может быть выполнена";
  }

  alert(message);
}
