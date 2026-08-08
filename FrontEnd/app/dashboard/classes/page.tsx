import type { Metadata } from 'next';
import ClassCatalog from '@/components/classes/ClassCatalog';

export const metadata: Metadata = {
  title: 'Classes',
  description: 'Browse all your subjects, lessons, and course materials.',
};

export default function ClassesPage() {
  return <ClassCatalog />;
}
