// Schema.org content management types

export type SchemaOrgType = 
  | 'Event'
  | 'Person' 
  | 'Organization'
  | 'BlogPosting'
  | 'NewsArticle'
  | 'Course'
  | 'EducationalOrganization'
  | 'CreativeWork'
  | 'WebPage'
  | 'Place'
  | 'PostalAddress'
  | 'ContactPoint'

export type SchemaPropertyType = 
  | 'text' 
  | 'url' 
  | 'email'
  | 'date' 
  | 'datetime-local'
  | 'number' 
  | 'tel'
  | 'textarea'
  | 'select'
  | 'boolean'
  | 'object'
  | 'array'

export interface SchemaProperty {
  name: string
  label: string
  type: SchemaPropertyType
  required: boolean
  description: string
  options?: string[] // for select fields
  placeholder?: string
  pattern?: string // regex pattern for validation
  min?: number
  max?: number
  nested?: SchemaProperty[] // for object/array types
  expectedTypes?: SchemaOrgType[] // for object references
}

export interface SchemaDefinition {
  type: SchemaOrgType
  label: string
  description: string
  category: 'content' | 'person' | 'organization' | 'event' | 'educational' | 'other'
  properties: SchemaProperty[]
  requiredProperties: string[]
}

export interface SchemaObject {
  id: string
  type: SchemaOrgType
  name: string // human-readable name for the archive
  data: Record<string, any> // the actual schema.org data
  jsonLD: string // generated JSON-LD
  createdAt: Date
  updatedAt: Date
  tags?: string[]
}

export interface SchemaArchive {
  objects: SchemaObject[]
  addObject: (object: Omit<SchemaObject, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateObject: (id: string, updates: Partial<SchemaObject>) => void
  removeObject: (id: string) => void
  getObjectsByType: (type: SchemaOrgType) => SchemaObject[]
  searchObjects: (query: string) => SchemaObject[]
}

// Pre-defined schema.org type definitions
export const SCHEMA_DEFINITIONS: Record<SchemaOrgType, SchemaDefinition> = {
  Event: {
    type: 'Event',
    label: 'Event',
    description: 'An event happening at a certain time and location',
    category: 'event',
    requiredProperties: ['name', 'startDate'],
    properties: [
      { name: 'name', label: 'Event Name', type: 'text', required: true, description: 'The name of the event' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the event' },
      { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: true, description: 'The start date and time of the event' },
      { name: 'endDate', label: 'End Date', type: 'datetime-local', required: false, description: 'The end date and time of the event' },
      { name: 'location', label: 'Location', type: 'text', required: false, description: 'The location of the event' },
      { name: 'url', label: 'Event URL', type: 'url', required: false, description: 'Link to the event page' },
      { name: 'organizer', label: 'Organizer', type: 'text', required: false, description: 'The organizer of the event' },
      { name: 'eventStatus', label: 'Event Status', type: 'select', required: false, description: 'The status of the event', 
        options: ['EventScheduled', 'EventCancelled', 'EventMovedOnline', 'EventPostponed', 'EventRescheduled'] },
      { name: 'eventAttendanceMode', label: 'Attendance Mode', type: 'select', required: false, description: 'How people can attend',
        options: ['OfflineEventAttendanceMode', 'OnlineEventAttendanceMode', 'MixedEventAttendanceMode'] }
    ]
  },
  Person: {
    type: 'Person',
    label: 'Person',
    description: 'A person (alive, dead, undead, or fictional)',
    category: 'person',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Full Name', type: 'text', required: true, description: 'The full name of the person' },
      { name: 'givenName', label: 'First Name', type: 'text', required: false, description: 'The given name (first name)' },
      { name: 'familyName', label: 'Last Name', type: 'text', required: false, description: 'The family name (last name)' },
      { name: 'email', label: 'Email', type: 'email', required: false, description: 'Email address' },
      { name: 'telephone', label: 'Phone', type: 'tel', required: false, description: 'Phone number' },
      { name: 'jobTitle', label: 'Job Title', type: 'text', required: false, description: 'The job title of the person' },
      { name: 'worksFor', label: 'Organization', type: 'text', required: false, description: 'The organization the person works for' },
      { name: 'url', label: 'Website', type: 'url', required: false, description: 'Link to the person\'s website or profile' },
      { name: 'image', label: 'Photo URL', type: 'url', required: false, description: 'URL to a photo of the person' },
      { name: 'description', label: 'Bio', type: 'textarea', required: false, description: 'A short biography' },
      { name: 'sameAs', label: 'Social Media URLs', type: 'textarea', required: false, description: 'Social media profile URLs (one per line)', 
        placeholder: 'https://linkedin.com/in/username\nhttps://twitter.com/username' }
    ]
  },
  Organization: {
    type: 'Organization',
    label: 'Organization',
    description: 'An organization such as a school, NGO, corporation, club, etc.',
    category: 'organization',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Organization Name', type: 'text', required: true, description: 'The name of the organization' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the organization' },
      { name: 'url', label: 'Website', type: 'url', required: false, description: 'The organization\'s website' },
      { name: 'email', label: 'Contact Email', type: 'email', required: false, description: 'Main contact email' },
      { name: 'telephone', label: 'Phone', type: 'tel', required: false, description: 'Main phone number' },
      { name: 'address', label: 'Address', type: 'textarea', required: false, description: 'Physical address' },
      { name: 'logo', label: 'Logo URL', type: 'url', required: false, description: 'URL to the organization logo' },
      { name: 'foundingDate', label: 'Founded', type: 'date', required: false, description: 'When the organization was founded' },
      { name: 'sameAs', label: 'Social Media URLs', type: 'textarea', required: false, description: 'Social media profile URLs (one per line)' }
    ]
  },
  BlogPosting: {
    type: 'BlogPosting',
    label: 'Blog Post',
    description: 'A blog post',
    category: 'content',
    requiredProperties: ['headline', 'author'],
    properties: [
      { name: 'headline', label: 'Title', type: 'text', required: true, description: 'The title of the blog post' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A short description or excerpt' },
      { name: 'articleBody', label: 'Content', type: 'textarea', required: false, description: 'The main content of the blog post' },
      { name: 'author', label: 'Author', type: 'text', required: true, description: 'The author of the blog post' },
      { name: 'datePublished', label: 'Publish Date', type: 'date', required: false, description: 'When the post was published' },
      { name: 'dateModified', label: 'Modified Date', type: 'date', required: false, description: 'When the post was last modified' },
      { name: 'url', label: 'Post URL', type: 'url', required: false, description: 'Link to the blog post' },
      { name: 'image', label: 'Featured Image URL', type: 'url', required: false, description: 'URL to the featured image' },
      { name: 'keywords', label: 'Keywords', type: 'text', required: false, description: 'Comma-separated keywords' },
      { name: 'wordCount', label: 'Word Count', type: 'number', required: false, description: 'Approximate word count' }
    ]
  },
  NewsArticle: {
    type: 'NewsArticle',
    label: 'News Article', 
    description: 'A news article',
    category: 'content',
    requiredProperties: ['headline', 'author'],
    properties: [
      { name: 'headline', label: 'Headline', type: 'text', required: true, description: 'The headline of the news article' },
      { name: 'description', label: 'Summary', type: 'textarea', required: false, description: 'A brief summary of the article' },
      { name: 'articleBody', label: 'Article Content', type: 'textarea', required: false, description: 'The main content of the article' },
      { name: 'author', label: 'Author', type: 'text', required: true, description: 'The author of the article' },
      { name: 'datePublished', label: 'Publish Date', type: 'datetime-local', required: false, description: 'When the article was published' },
      { name: 'dateModified', label: 'Modified Date', type: 'datetime-local', required: false, description: 'When the article was last modified' },
      { name: 'url', label: 'Article URL', type: 'url', required: false, description: 'Link to the news article' },
      { name: 'image', label: 'Featured Image URL', type: 'url', required: false, description: 'URL to the featured image' },
      { name: 'keywords', label: 'Keywords', type: 'text', required: false, description: 'Comma-separated keywords' },
      { name: 'dateline', label: 'Dateline', type: 'text', required: false, description: 'The dateline of the article (location and date)' }
    ]
  },
  Course: {
    type: 'Course',
    label: 'Course',
    description: 'A course or class, typically part of a sequence or program',
    category: 'educational',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Course Name', type: 'text', required: true, description: 'The name of the course' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the course' },
      { name: 'provider', label: 'Provider', type: 'text', required: false, description: 'The institution or organization providing the course' },
      { name: 'instructor', label: 'Instructor', type: 'text', required: false, description: 'The instructor(s) of the course' },
      { name: 'courseCode', label: 'Course Code', type: 'text', required: false, description: 'The course code or identifier' },
      { name: 'educationalLevel', label: 'Level', type: 'select', required: false, description: 'The educational level',
        options: ['Beginner', 'Intermediate', 'Advanced', 'Undergraduate', 'Graduate', 'Professional'] },
      { name: 'timeRequired', label: 'Duration', type: 'text', required: false, description: 'Time required to complete (e.g., "10 weeks")' },
      { name: 'url', label: 'Course URL', type: 'url', required: false, description: 'Link to the course page' },
      { name: 'startDate', label: 'Start Date', type: 'date', required: false, description: 'When the course starts' },
      { name: 'endDate', label: 'End Date', type: 'date', required: false, description: 'When the course ends' }
    ]
  },
  EducationalOrganization: {
    type: 'EducationalOrganization',
    label: 'Educational Organization',
    description: 'An educational organization',
    category: 'organization',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Institution Name', type: 'text', required: true, description: 'The name of the educational institution' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the institution' },
      { name: 'url', label: 'Website', type: 'url', required: false, description: 'The institution\'s website' },
      { name: 'email', label: 'Contact Email', type: 'email', required: false, description: 'Main contact email' },
      { name: 'telephone', label: 'Phone', type: 'tel', required: false, description: 'Main phone number' },
      { name: 'address', label: 'Address', type: 'textarea', required: false, description: 'Physical address' },
      { name: 'logo', label: 'Logo URL', type: 'url', required: false, description: 'URL to the institution logo' },
      { name: 'foundingDate', label: 'Founded', type: 'date', required: false, description: 'When the institution was founded' },
      { name: 'accreditingBody', label: 'Accrediting Body', type: 'text', required: false, description: 'Organization that accredits this institution' }
    ]
  },
  CreativeWork: {
    type: 'CreativeWork',
    label: 'Creative Work',
    description: 'A creative work such as a teaching note, research paper, or other scholarly content',
    category: 'content',
    requiredProperties: ['name', 'author'],
    properties: [
      { name: 'name', label: 'Title', type: 'text', required: true, description: 'The title of the work' },
      { name: 'description', label: 'Abstract/Summary', type: 'textarea', required: false, description: 'An abstract or summary of the work' },
      { name: 'author', label: 'Author(s)', type: 'text', required: true, description: 'The author(s) of the work' },
      { name: 'dateCreated', label: 'Created Date', type: 'date', required: false, description: 'When the work was created' },
      { name: 'datePublished', label: 'Published Date', type: 'date', required: false, description: 'When the work was published' },
      { name: 'url', label: 'URL', type: 'url', required: false, description: 'Link to the work' },
      { name: 'keywords', label: 'Keywords', type: 'text', required: false, description: 'Comma-separated keywords' },
      { name: 'genre', label: 'Genre/Type', type: 'text', required: false, description: 'The genre or type of work (e.g., "Teaching Note", "Research Paper")' },
      { name: 'license', label: 'License', type: 'text', required: false, description: 'The license under which the work is published' },
      { name: 'version', label: 'Version', type: 'text', required: false, description: 'Version number or identifier' }
    ]
  },
  WebPage: {
    type: 'WebPage',
    label: 'Web Page',
    description: 'A web page',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Page Title', type: 'text', required: true, description: 'The title of the web page' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the page content' },
      { name: 'url', label: 'Page URL', type: 'url', required: false, description: 'The URL of the page' },
      { name: 'author', label: 'Author', type: 'text', required: false, description: 'The author of the page' },
      { name: 'datePublished', label: 'Published Date', type: 'date', required: false, description: 'When the page was published' },
      { name: 'dateModified', label: 'Modified Date', type: 'date', required: false, description: 'When the page was last modified' },
      { name: 'keywords', label: 'Keywords', type: 'text', required: false, description: 'Comma-separated keywords' },
      { name: 'breadcrumb', label: 'Breadcrumb', type: 'text', required: false, description: 'Breadcrumb navigation path' }
    ]
  },
  Place: {
    type: 'Place',
    label: 'Place',
    description: 'A place or location',
    category: 'other',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Place Name', type: 'text', required: true, description: 'The name of the place' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the place' },
      { name: 'address', label: 'Address', type: 'textarea', required: false, description: 'The physical address' },
      { name: 'telephone', label: 'Phone', type: 'tel', required: false, description: 'Phone number' },
      { name: 'url', label: 'Website', type: 'url', required: false, description: 'Website URL' },
      { name: 'geo', label: 'Coordinates', type: 'text', required: false, description: 'GPS coordinates (latitude, longitude)', placeholder: '40.7128, -74.0060' },
      { name: 'openingHours', label: 'Opening Hours', type: 'text', required: false, description: 'Opening hours specification' },
      { name: 'photo', label: 'Photo URL', type: 'url', required: false, description: 'URL to a photo of the place' }
    ]
  },
  PostalAddress: {
    type: 'PostalAddress', 
    label: 'Postal Address',
    description: 'A postal address',
    category: 'other',
    requiredProperties: ['streetAddress'],
    properties: [
      { name: 'streetAddress', label: 'Street Address', type: 'text', required: true, description: 'The street address' },
      { name: 'addressLocality', label: 'City', type: 'text', required: false, description: 'The locality/city' },
      { name: 'addressRegion', label: 'State/Region', type: 'text', required: false, description: 'The region/state' },
      { name: 'postalCode', label: 'Postal Code', type: 'text', required: false, description: 'The postal/ZIP code' },
      { name: 'addressCountry', label: 'Country', type: 'text', required: false, description: 'The country' }
    ]
  },
  ContactPoint: {
    type: 'ContactPoint',
    label: 'Contact Point',
    description: 'A contact point for a person or organization',
    category: 'other',
    requiredProperties: ['contactType'],
    properties: [
      { name: 'contactType', label: 'Contact Type', type: 'select', required: true, description: 'The type of contact',
        options: ['customer service', 'technical support', 'billing support', 'bill payment', 'sales', 'reservations', 'credit card support', 'emergency', 'baggage tracking', 'roadside assistance', 'package tracking'] },
      { name: 'telephone', label: 'Phone', type: 'tel', required: false, description: 'Phone number' },
      { name: 'email', label: 'Email', type: 'email', required: false, description: 'Email address' },
      { name: 'url', label: 'Contact URL', type: 'url', required: false, description: 'URL to contact form or page' },
      { name: 'availableLanguage', label: 'Available Languages', type: 'text', required: false, description: 'Languages available for this contact point' },
      { name: 'hoursAvailable', label: 'Hours Available', type: 'text', required: false, description: 'Hours when this contact point is available' }
    ]
  }
}
