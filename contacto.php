<?php
// Procesa el formulario de contacto. Cambia $para por tu correo real.
header('Content-Type: application/json; charset=utf-8');
$para = 'lucero.julca@tecsup.edu.pe';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false,'error'=>'Método no permitido.']); exit; }
if (!empty($_POST['web'])) { echo json_encode(['ok'=>true]); exit; } // trampa anti-spam

$nombre  = trim(strip_tags($_POST['nombre'] ?? ''));
$correo  = trim($_POST['correo'] ?? '');
$mensaje = trim(strip_tags($_POST['mensaje'] ?? ''));

if (mb_strlen($nombre) < 2 || mb_strlen($mensaje) < 10 || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422); echo json_encode(['ok'=>false,'error'=>'Completa todos los campos correctamente.']); exit;
}
$correo = str_replace(["\r","\n"], '', $correo);
$nombre = str_replace(["\r","\n"], ' ', $nombre);

$asunto  = '=?UTF-8?B?'.base64_encode("Nuevo mensaje de $nombre (miguelpallin.com)").'?=';
$cuerpo  = "Nombre: $nombre\nCorreo: $correo\n\nMensaje:\n$mensaje\n";
$host    = $_SERVER['HTTP_HOST'] ?? 'miguelpallin.com';
$headers = "From: Portafolio <no-reply@$host>\r\nReply-To: $correo\r\nContent-Type: text/plain; charset=UTF-8\r\n";

if (@mail($para, $asunto, $cuerpo, $headers)) echo json_encode(['ok'=>true]);
else { http_response_code(500); echo json_encode(['ok'=>false,'error'=>'No se pudo enviar el correo. Inténtalo más tarde.']); }
