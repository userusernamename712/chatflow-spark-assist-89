import { useCallback, useEffect, useState } from "react";

export const TRANSLATIONS = {
  en: {
    profile_title: "Profile & Settings",
    select_customer: "Select Customer",
    search_customers: "Search customers...",
    language: "Language",
    select_language: "Select language",
    api_capabilities: "API Capabilities",
    tools: "Tools",
    resources: "Resources",
    servers: "Servers",
    feedback_saved: "Feedback saved",
    thank_you_feedback: "Thank you for your feedback!",
    error_saving_feedback: "Error saving feedback",
    add_feedback: "Add feedback",
    delete_conversation: "Delete conversation",
    conversation_deleted: "Conversation deleted",
    deleted_description: "The conversation has been removed.",
    error_deleting_conversation: "Error deleting conversation",
    conversation_history: "Conversation History",
    new_chat: "New Chat",
    no_conversations: "No conversations yet",
    sign_out: "Sign out",
    rate_conversation: "Rate Conversation",
    rate_experience: "Please rate your experience and provide any feedback.",
    cancel: "Cancel",
    save: "Save",
    add_feedback_optional: "Add your feedback here (optional)",
    are_you_sure_delete: "Are you sure you want to delete this conversation? This action cannot be undone.",
    delete: "Delete",
    customer_selected_title: "Customer Selected",
    customer_selected_desc: "Switched to",
    new_conversation: "New conversation",
    error_loading_conversations: "Error loading conversations",
    welcome_back: "Welcome back!",
    login_success_desc: "You've logged in successfully to the bookline.AI team portal.",
    chat_with_bookline: "Chat with Bookline's Data Analytics",
    sign_in_to_access: "Sign in to access your assistant",
    email: "Email",
    email_placeholder: "your.email@example.com",
    password: "Password",
    password_placeholder: "••••••••",
    sign_in: "Sign in",
    signing_in: "Signing in",
    auth_error: "Authentication error",
    return_home: "Return to Home",
    loading: "Loading",
    loading_conversation: "Loading conversation",
    viewing_chat_history: "viewing chat history",
    online: "online"
  },
  ca: {
    profile_title: "Perfil i configuració",
    select_customer: "Selecciona Client",
    search_customers: "Cerca clients...",
    language: "Idioma",
    select_language: "Selecciona l'idioma",
    api_capabilities: "Capacitats de l'API",
    tools: "Eines",
    resources: "Recursos",
    servers: "Servidors",
    feedback_saved: "Comentari desat",
    thank_you_feedback: "Gràcies pel teu comentari!",
    error_saving_feedback: "Error en desar el comentari",
    add_feedback: "Afegeix comentari",
    delete_conversation: "Elimina la conversa",
    conversation_deleted: "Conversa eliminada",
    deleted_description: "La conversa ha estat eliminada.",
    error_deleting_conversation: "Error en eliminar la conversa",
    conversation_history: "Historial de converses",
    new_chat: "Nova conversa",
    no_conversations: "Encara no hi ha converses",
    sign_out: "Tancar sessió",
    rate_conversation: "Valora la conversa",
    rate_experience: "Valora la teva experiència i deixa'ns comentaris.",
    cancel: "Cancel·la",
    save: "Desa",
    add_feedback_optional: "Afegeix aquí el teu comentari (opcional)",
    are_you_sure_delete: "Segur que vols eliminar aquesta conversa? Aquesta acció no es pot desfer.",
    delete: "Elimina",
    customer_selected_title: "Client seleccionat",
    customer_selected_desc: "S'ha canviat a",
    new_conversation: "Conversa nova",
    error_loading_conversations: "Error en carregar les converses",
    welcome_back: "Benvingut/da de nou!",
    login_success_desc: "Has iniciat sessió correctament al portal d'equip de bookline.AI.",
    chat_with_bookline: "Xateja amb l'analítica de dades de Bookline",
    sign_in_to_access: "Inicia sessió per accedir al teu assistent",
    email: "Correu electrònic",
    email_placeholder: "el.teu.correu@exemple.com",
    password: "Contrasenya",
    password_placeholder: "••••••••",
    sign_in: "Iniciar sessió",
    signing_in: "Iniciant sessió",
    auth_error: "Error d'autenticació",
    return_home: "Tornar a l'inici",
    loading: "Carregant",
    loading_conversation: "Carregant conversa",
    viewing_chat_history: "visualitzant historial",
    online: "en línia"
  },
  es: {
    profile_title: "Perfil y configuración",
    select_customer: "Seleccionar cliente",
    search_customers: "Buscar clientes...",
    language: "Idioma",
    select_language: "Seleccionar idioma",
    api_capabilities: "Capacidades de API",
    tools: "Herramientas",
    resources: "Recursos",
    servers: "Servidores",
    feedback_saved: "Comentario guardado",
    thank_you_feedback: "¡Gracias por tus comentarios!",
    error_saving_feedback: "Error al guardar comentario",
    add_feedback: "Agregar comentario",
    delete_conversation: "Eliminar conversación",
    conversation_deleted: "Conversación eliminada",
    deleted_description: "La conversación ha sido eliminada.",
    error_deleting_conversation: "Error al eliminar conversación",
    conversation_history: "Historial de conversaciones",
    new_chat: "Nueva charla",
    no_conversations: "Aún no hay conversaciones",
    sign_out: "Cerrar sesión",
    rate_conversation: "Valorar conversación",
    rate_experience: "Valora tu experiencia y agrega comentarios.",
    cancel: "Cancelar",
    save: "Guardar",
    add_feedback_optional: "Agrega aquí tus comentarios (opcional)",
    are_you_sure_delete: "¿Seguro que deseas eliminar esta conversación? Esta acción no se puede deshacer.",
    delete: "Eliminar",
    customer_selected_title: "Cliente seleccionado",
    customer_selected_desc: "Cambiado a",
    new_conversation: "Conversación nueva",
    error_loading_conversations: "Error al cargar conversaciones",
    welcome_back: "¡Bienvenido/a de nuevo!",
    login_success_desc: "Has iniciado sesión correctamente en el portal de equipo de bookline.AI.",
    chat_with_bookline: "Chatea con el análisis de datos de Bookline",
    sign_in_to_access: "Inicia sesión para acceder a tu asistente",
    email: "Correo electrónico",
    email_placeholder: "tu.correo@ejemplo.com",
    password: "Contraseña",
    password_placeholder: "••••••••",
    sign_in: "Iniciar sesión",
    signing_in: "Iniciando sesión",
    auth_error: "Error de autenticación",
    return_home: "Volver al inicio",
    loading: "Cargando",
    loading_conversation: "Cargando conversación",
    viewing_chat_history: "viendo historial",
    online: "en línea"
  }
};

const LANGUAGES = [
  { code: "ca", label: "Català" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

const LANGUAGE_KEY = "selected-language";

export function useLanguage() {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem(LANGUAGE_KEY) || "en";
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((code: string) => {
    setLanguageState(code);
  }, []);

  const t = useCallback(
    (key: keyof typeof TRANSLATIONS["en"]) => {
      return (
        TRANSLATIONS[language as keyof typeof TRANSLATIONS]?.[key] ||
        TRANSLATIONS["en"][key] ||
        key
      );
    },
    [language]
  );

  const languageLabel = LANGUAGES.find(l => l.code === language)?.label || "English";

  return {
    language,
    setLanguage,
    languageLabel,
    t,
    availableLanguages: LANGUAGES,
  };
}
