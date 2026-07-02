#!/usr/bin/env python3
"""Generate TypeScript API types, wrappers, and React Query hooks from openapi.json.

Run from the repo root:
    python scripts/generate-api.py
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPEC_PATH = ROOT / 'openapi.json'

TYPES_PATH = ROOT / 'src/types/api.ts'
AUTH_TYPES_PATH = ROOT / 'src/types/auth.ts'
RESOURCES_PATH = ROOT / 'src/api/resources.ts'
AUTH_API_PATH = ROOT / 'src/auth/auth-api.ts'
HOOKS_PATH = ROOT / 'src/api/hooks.ts'

AUTH_SCHEMAS = {
    'TokenResponse',
    'RegisterRequest',
    'LoginRequest',
    'VerifyEmailRequest',
    'UserMeResponse',
    'UserUpdateRequest',
    'ChangePasswordRequest',
    'ProvidersResponse',
    'OAuthProviderInfo',
    'UserRole',
}


def load_spec():
    with open(SPEC_PATH, encoding='utf-8') as f:
        return json.load(f)


def to_camel(snake: str) -> str:
    parts = snake.split('_')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])


def schema_to_ts(name: str, schema: dict, spec: dict) -> str:
    if '$ref' in schema:
        return ref_to_ts(schema['$ref'])

    if 'enum' in schema and schema.get('type') == 'string':
        return ' | '.join(f"'{v}'" for v in schema['enum'])

    if schema.get('type') == 'array':
        item_type = schema_to_ts(name, schema.get('items', {}), spec)
        return f"{item_type}[]"

    if schema.get('type') == 'object':
        props = schema.get('properties', {})
        required = set(schema.get('required', []))
        if not props and schema.get('additionalProperties'):
            value_type = 'unknown'
            add = schema['additionalProperties']
            if isinstance(add, dict):
                value_type = schema_to_ts(name, add, spec)
            return f"Record<string, {value_type}>"
        if not props:
            return 'Record<string, unknown>'
        lines = []
        for prop_name, prop_schema in props.items():
            optional = '' if prop_name in required else '?'
            ts_type = schema_to_ts(prop_name, prop_schema, spec)
            desc = prop_schema.get('description', '')
            if desc:
                lines.append(f"  /** {desc} */")
            lines.append(f"  {prop_name}{optional}: {ts_type};")
        body = '\n'.join(lines)
        return f"{{\n{body}\n}}"

    if 'anyOf' in schema:
        parts = [schema_to_ts(name, s, spec) for s in schema['anyOf']]
        return ' | '.join(parts)

    t = schema.get('type')
    if t == 'string':
        return 'string'
    if t == 'integer' or t == 'number':
        return 'number'
    if t == 'boolean':
        return 'boolean'
    if t == 'null':
        return 'null'
    return 'unknown'


def ref_to_ts(ref: str) -> str:
    return ref.rsplit('/', 1)[-1]


def resolve_response_type(op: dict) -> tuple[str, bool]:
    responses = op.get('responses', {})
    ok_response = responses.get('200') or responses.get('201')
    if not ok_response:
        return 'void', False
    content = ok_response.get('content', {})
    json_content = content.get('application/json', {})
    schema = json_content.get('schema')
    if not schema:
        return 'void', False
    if '$ref' in schema:
        return ref_to_ts(schema['$ref']), True
    if schema.get('type') == 'array' and '$ref' in schema.get('items', {}):
        return f"{ref_to_ts(schema['items']['$ref'])}[]", True
    if schema.get('type') == 'object' and schema.get('additionalProperties'):
        value_type = 'string'
        add = schema['additionalProperties']
        if isinstance(add, dict):
            value_type = schema_to_ts('value', add, {})
        return f"Record<string, {value_type}>", True
    return 'unknown', True


def _patch_token_response_required(lines: list[str]) -> None:
    for i, line in enumerate(lines):
        if 'refresh_token?: string | null;' in line:
            lines[i] = line.replace('?', '')


def generate_types(spec: dict) -> None:
    schemas = spec['components']['schemas']

    auth_lines = ["""/**
 * Shared auth domain types, mirrored from the hefest-api contract
 * (`openapi.json`). See the HEF-41 design spec.
 */"""]
    api_lines = ["""/**
 * Auto-generated API domain types from `openapi.json`.
 * Run `python scripts/generate-api.py` to regenerate.
 */"""]

    for name in sorted(schemas.keys()):
        schema = schemas[name]
        desc = schema.get('description', '')
        ts = schema_to_ts(name, schema, spec)
        block = []
        if desc:
            block.append(f"/** {desc} */")
        block.append(f"export type {name} = {ts};")
        if name in AUTH_SCHEMAS:
            auth_lines.extend(block)
            auth_lines.append('')
        else:
            api_lines.extend(block)
            api_lines.append('')

    auth_lines.append("/** Message map returned by POST /register. */")
    auth_lines.append("export type RegisterResponse = Record<string, string>;")
    auth_lines.append("")

    auth_lines.append("/** Alias for the current user response. */")
    auth_lines.append("export type UserMe = UserMeResponse;")
    auth_lines.append("")

    _patch_token_response_required(auth_lines)

    AUTH_TYPES_PATH.write_text('\n'.join(auth_lines).rstrip() + '\n', encoding='utf-8')
    TYPES_PATH.write_text('\n'.join(api_lines).rstrip() + '\n', encoding='utf-8')


def path_to_template(path: str) -> str:
    return path.replace('{', '${').replace('}', '}')


def operation_to_function_name(method: str, path: str, op: dict) -> str:
    op_id = op.get('operationId', '')
    if op_id:
        return to_camel(op_id)
    parts = [method] + [p for p in path.split('/') if p and '{' not in p]
    return to_camel('_'.join(parts))


def generate_resources(spec: dict) -> None:
    lines = ["""/**
 * Auto-generated REST API wrappers from `openapi.json`.
 * Run `python scripts/generate-api.py` to regenerate.
 */

import { apiClient } from '@/api/client';
import type {
  DeviceRegisterRequest,
  DeviceResponse,
  DeviceUnregisterRequest,
  EventCreateRequest,
  EventDetailResponse,
  EventResponse,
  EventUpdateRequest,
  HealthResponse,
  MyRegistrationResponse,
  NotificationJobDetailResponse,
  NotificationJobResponse,
  OrganizerStatsResponse,
  ReadyResponse,
  RegistrationResponse,
  RegistrationSummary,
} from '@/types/api';

"""]

    for path, methods in spec['paths'].items():
        for method, op in methods.items():
            if not isinstance(op, dict):
                continue
            tags = op.get('tags', [])
            if 'auth' in tags or 'sso' in tags:
                continue

            fn_name = operation_to_function_name(method, path, op)
            template = path_to_template(path)
            params = op.get('parameters', [])
            path_params = [p for p in params if p.get('in') == 'path']
            query_params = [p for p in params if p.get('in') == 'query']

            args: list[str] = []
            call_args: list[str] = []

            for p in path_params:
                pname = p['name']
                args.append(f"{pname}: string")

            request_body = op.get('requestBody')
            body_schema = None
            if request_body:
                content = request_body.get('content', {})
                json_content = content.get('application/json', {})
                body_schema = json_content.get('schema')
                if body_schema and '$ref' in body_schema:
                    body_type = ref_to_ts(body_schema['$ref'])
                    args.append(f"body: {body_type}")
                    call_args.append('body')

            for p in query_params:
                pname = p['name']
                optional = '' if p.get('required') else '?'
                args.append(f"{pname}{optional}: string")

            response_type, has_body = resolve_response_type(op)
            arg_str = ', '.join(args)
            method_lower = method.lower()

            if has_body:
                lines.append(f"export async function {fn_name}({arg_str}): Promise<{response_type}> {{")
                if call_args:
                    if query_params:
                        lines.append(f"  const params = {{ {', '.join(p['name'] + ': ' + p['name'] for p in query_params)} }};")
                        lines.append(f"  const {{ data }} = await apiClient.{method_lower}<{response_type}>(`{template}`, {', '.join(call_args)}, {{ params }});")
                    else:
                        lines.append(f"  const {{ data }} = await apiClient.{method_lower}<{response_type}>(`{template}`, {', '.join(call_args)});")
                else:
                    if query_params:
                        lines.append(f"  const params = {{ {', '.join(p['name'] + ': ' + p['name'] for p in query_params)} }};")
                        lines.append(f"  const {{ data }} = await apiClient.{method_lower}<{response_type}>(`{template}`, {{ params }});")
                    else:
                        lines.append(f"  const {{ data }} = await apiClient.{method_lower}<{response_type}>(`{template}`);")
                lines.append('  return data;')
                lines.append('}')
            else:
                lines.append(f"export async function {fn_name}({arg_str}): Promise<void> {{")
                if call_args:
                    if query_params:
                        lines.append(f"  const params = {{ {', '.join(p['name'] + ': ' + p['name'] for p in query_params)} }};")
                        lines.append(f"  await apiClient.{method_lower}(`{template}`, {', '.join(call_args)}, {{ params }});")
                    else:
                        lines.append(f"  await apiClient.{method_lower}(`{template}`, {', '.join(call_args)});")
                else:
                    if query_params:
                        lines.append(f"  const params = {{ {', '.join(p['name'] + ': ' + p['name'] for p in query_params)} }};")
                        lines.append(f"  await apiClient.{method_lower}(`{template}`, {{ params }});")
                    else:
                        lines.append(f"  await apiClient.{method_lower}(`{template}`);")
                lines.append('}')
            lines.append('')

    RESOURCES_PATH.write_text('\n'.join(lines).rstrip() + '\n', encoding='utf-8')


def generate_auth_api(spec: dict) -> None:
    lines = ["""/**
 * Typed wrappers over the hefest-api auth endpoints. Auth endpoints that
 * establish a session (`register`, `verify-email`, `login`) are marked
 * `skipAuth` so the interceptors don't try to attach/refresh a Bearer token
 * the caller doesn't have yet.
 */

import { apiClient } from '@/api/client';
import type {
  ChangePasswordRequest,
  LoginRequest,
  ProvidersResponse,
  RegisterRequest,
  RegisterResponse,
  TokenResponse,
  UserMeResponse,
  UserUpdateRequest,
} from '@/types/auth';

const SKIP_AUTH = { skipAuth: true } as const;

export async function register(
  body: RegisterRequest,
): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>('/register', body, SKIP_AUTH);
  return data;
}

export async function verifyEmail(token: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(
    '/auth/verify-email',
    { token },
    SKIP_AUTH,
  );
  return data;
}

export async function login(body: LoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>('/login', body, SKIP_AUTH);
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refresh_token: refreshToken }, SKIP_AUTH);
}

export async function logoutAll(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout-all', { refresh_token: refreshToken }, SKIP_AUTH);
}

export async function changePassword(body: ChangePasswordRequest): Promise<void> {
  await apiClient.post('/auth/change-password', body);
}

export async function fetchMe(): Promise<UserMeResponse> {
  const { data } = await apiClient.get<UserMeResponse>('/users/me');
  return data;
}

export async function updateMe(body: UserUpdateRequest): Promise<UserMeResponse> {
  const { data } = await apiClient.patch<UserMeResponse>('/users/me', body);
  return data;
}

export async function fetchProviders(): Promise<ProvidersResponse> {
  const { data } = await apiClient.get<ProvidersResponse>('/auth/providers', SKIP_AUTH);
  return data;
}
"""]
    AUTH_API_PATH.write_text(''.join(lines), encoding='utf-8')


def generate_hooks(spec: dict) -> None:
    api_response_types: set[str] = set()
    query_hooks: list[str] = []
    mutation_hooks: list[str] = []

    for path, methods in spec['paths'].items():
        for method, op in methods.items():
            if not isinstance(op, dict):
                continue
            tags = op.get('tags', [])
            if 'sso' in tags or 'auth' in tags:
                continue

            fn_name = operation_to_function_name(method, path, op)
            hook_name = fn_name[0].upper() + fn_name[1:]
            params = op.get('parameters', [])
            path_params = [p for p in params if p.get('in') == 'path']
            query_params = [p for p in params if p.get('in') == 'query']
            response_type, has_body = resolve_response_type(op)
            

            if method.upper() == 'GET':
                if response_type != 'void':
                    api_response_types.add(response_type.rstrip('[]'))
                key_parts = [f"'{fn_name}'"]
                fn_args: list[str] = []
                for p in path_params:
                    pname = p['name']
                    key_parts.append(pname)
                    fn_args.append(f"{pname}: string")
                for p in query_params:
                    pname = p['name']
                    key_parts.append(pname)
                    fn_args.append(f"{pname}?: string")

                arg_str = ', '.join(fn_args)
                key_str = ', '.join(key_parts)
                call_args = [p['name'] for p in path_params + query_params]
                query_hooks.append(f"export function use{hook_name}({arg_str}) {{")
                if call_args:
                    query_hooks.append(
                        f"  return useQuery<{response_type}>({{ queryKey: [{key_str}], queryFn: () => resources.{fn_name}({', '.join(call_args)}) }});"
                    )
                else:
                    query_hooks.append(
                        f"  return useQuery<{response_type}>({{ queryKey: [{key_str}], queryFn: resources.{fn_name} }});"
                    )
                query_hooks.append('}')
                query_hooks.append('')
            else:
                request_body = op.get('requestBody')
                body_type = None
                if request_body:
                    content = request_body.get('content', {})
                    json_content = content.get('application/json', {})
                    body_schema = json_content.get('schema')
                    if body_schema and '$ref' in body_schema:
                        body_type = ref_to_ts(body_schema['$ref'])
                        api_response_types.add(body_type)

                mutation_hooks.append(f"export function use{hook_name}() {{")
                if path_params and body_type:
                    pnames = [p['name'] for p in path_params]
                    mutation_hooks.append("  return useMutation({")
                    mutation_hooks.append(
                        f"    mutationFn: ({{ {', '.join(pnames)}, body }}: {{ {', '.join(f'{n}: string' for n in pnames)}; body: {body_type} }}) =>"
                    )
                    mutation_hooks.append(
                        f"      resources.{fn_name}({', '.join(pnames)}, body),"
                    )
                    mutation_hooks.append('  });')
                elif path_params:
                    pnames = [p['name'] for p in path_params]
                    mutation_hooks.append("  return useMutation({")
                    mutation_hooks.append(
                        f"    mutationFn: ({', '.join(f'{n}: string' for n in pnames)}) =>"
                    )
                    mutation_hooks.append(
                        f"      resources.{fn_name}({', '.join(pnames)}),"
                    )
                    mutation_hooks.append('  });')
                elif body_type:
                    mutation_hooks.append("  return useMutation({")
                    mutation_hooks.append(
                        f"    mutationFn: (body: {body_type}) => resources.{fn_name}(body),"
                    )
                    mutation_hooks.append('  });')
                else:
                    mutation_hooks.append("  return useMutation({")
                    mutation_hooks.append(
                        f"    mutationFn: () => resources.{fn_name}(),"
                    )
                    mutation_hooks.append('  });')
                mutation_hooks.append('}')
                mutation_hooks.append('')

    type_imports = ',\n  '.join(sorted(api_response_types)) if api_response_types else ''
    imports = f"""/**
 * Auto-generated React Query hooks from `openapi.json`.
 * Run `python scripts/generate-api.py` to regenerate.
 */

import {{ useMutation, useQuery }} from '@tanstack/react-query';

import * as authApi from '@/auth/auth-api';
import * as resources from '@/api/resources';
import type {{
  {type_imports}
}} from '@/types/api';

"""

    auth_mutations = """/** Auth mutations (convenience only; prefer `useAuth` for session-aware flows). */
export function useRegister() {
  return useMutation({ mutationFn: authApi.register });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: authApi.verifyEmail });
}

export function useLogin() {
  return useMutation({ mutationFn: authApi.login });
}

export function useChangePassword() {
  return useMutation({ mutationFn: authApi.changePassword });
}

export function useUpdateMe() {
  return useMutation({ mutationFn: authApi.updateMe });
}
"""

    sections = [imports]
    if query_hooks:
        sections.extend(query_hooks)
    if mutation_hooks:
        sections.extend(mutation_hooks)
    sections.append(auth_mutations)

    HOOKS_PATH.write_text('\n'.join(sections).rstrip() + '\n', encoding='utf-8')


def main():
    spec = load_spec()
    generate_types(spec)
    generate_auth_api(spec)
    generate_resources(spec)
    generate_hooks(spec)
    print('Generated:')
    print(f'  {TYPES_PATH}')
    print(f'  {AUTH_TYPES_PATH}')
    print(f'  {AUTH_API_PATH}')
    print(f'  {RESOURCES_PATH}')
    print(f'  {HOOKS_PATH}')


if __name__ == '__main__':
    main()
