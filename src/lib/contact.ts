import type { ContactFormValues } from './content';
export function validateContact(values: ContactFormValues): Partial<Record<keyof ContactFormValues, string>> {
 const errors: Partial<Record<keyof ContactFormValues, string>> = {};
 if (!values.name.trim()) errors.name = 'Enter your name.';
 if (!values.email.trim()) errors.email = 'Enter your email address.';
 else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address, such as name@example.com.';
 if (!values.phone.trim()) errors.phone = 'Enter your phone number.';
 else if (!/^\d+$/.test(values.phone)) errors.phone = 'Use digits only, without spaces or a + sign.';
 if (!values.message.trim()) errors.message = 'Write a message.';
 return errors;
}
