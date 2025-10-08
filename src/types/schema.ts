// Schema.org content management types

export type SchemaOrgType = 
  | 'AudioObject'
  | 'ImageObject'
  | 'VideoObject'
  | 'Event'
  | 'Organization'
  | 'Person'
  | 'CreativeWork'
  // Event More Specific Types
  | 'BusinessEvent'
  | 'ChildrensEvent'
  | 'ComedyEvent'
  | 'CourseInstance'
  | 'DanceEvent'
  | 'DeliveryEvent'
  | 'EducationEvent'
  | 'ExhibitionEvent'
  | 'Festival'
  | 'FoodEvent'
  | 'LiteraryEvent'
  | 'MusicEvent'
  | 'PublicationEvent'
  | 'SaleEvent'
  | 'ScreeningEvent'
  | 'SocialEvent'
  | 'SportsEvent'
  | 'TheaterEvent'
  | 'VisualArtsEvent'
  // Organization More Specific Types
  | 'Corporation'
  | 'EducationalOrganization'
  | 'GovernmentOrganization'
  | 'LibrarySystem'
  | 'LocalBusiness'
  | 'MedicalOrganization'
  | 'NewsMediaOrganization'
  | 'NGO'
  | 'PerformingGroup'
  | 'ResearchOrganization'
  | 'SportsOrganization'
  | 'WorkersUnion'
  // Person More Specific Types
  | 'Patient'
  // CreativeWork More Specific Types (from schema.org/CreativeWork)
  | 'Article'
  | 'BlogPosting'
  | 'NewsArticle'
  | 'Book'
  | 'Movie'
  | 'TVSeries'
  | 'MusicRecording'
  | 'Photograph'
  | 'Painting'
  | 'Sculpture'
  | 'Review'
  | 'SoftwareApplication'
  | 'WebPage'
  | 'WebSite'
  | 'Course'
  | 'Recipe'
  | 'HowTo'
  | 'Game'
  | 'Dataset'
  | 'ScholarlyArticle'

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
  AudioObject: {
    type: 'AudioObject',
    label: 'Audio Object',
    description: 'An audio file or audio content',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Audio Title', type: 'text', required: true, description: 'The title of the audio content' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the audio content' },
      { name: 'contentUrl', label: 'Audio URL', type: 'url', required: false, description: 'Direct URL to the audio file' },
      { name: 'embedUrl', label: 'Embed URL', type: 'url', required: false, description: 'URL for embedding the audio player' },
      { name: 'duration', label: 'Duration', type: 'text', required: false, description: 'Duration in ISO 8601 format (e.g., PT3M30S)', placeholder: 'PT3M30S' },
      { name: 'encodingFormat', label: 'Format', type: 'text', required: false, description: 'Audio format (e.g., MP3, WAV)', placeholder: 'audio/mpeg' },
      { name: 'creator', label: 'Creator', type: 'text', required: false, description: 'The creator of the audio content' },
      { name: 'datePublished', label: 'Published Date', type: 'date', required: false, description: 'When the audio was published' },
      { name: 'transcript', label: 'Transcript', type: 'textarea', required: false, description: 'Text transcript of the audio content' }
    ]
  },
  ImageObject: {
    type: 'ImageObject',
    label: 'Image Object',
    description: 'An image file or visual content',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Image Title', type: 'text', required: true, description: 'The title or name of the image' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'Alt text or description of the image' },
      { name: 'contentUrl', label: 'Image URL', type: 'url', required: false, description: 'Direct URL to the image file' },
      { name: 'width', label: 'Width', type: 'number', required: false, description: 'Width of the image in pixels' },
      { name: 'height', label: 'Height', type: 'number', required: false, description: 'Height of the image in pixels' },
      { name: 'encodingFormat', label: 'Format', type: 'text', required: false, description: 'Image format (e.g., JPEG, PNG)', placeholder: 'image/jpeg' },
      { name: 'creator', label: 'Creator/Photographer', type: 'text', required: false, description: 'The creator or photographer' },
      { name: 'dateCreated', label: 'Created Date', type: 'date', required: false, description: 'When the image was created' },
      { name: 'copyrightHolder', label: 'Copyright Holder', type: 'text', required: false, description: 'Who holds the copyright' },
      { name: 'license', label: 'License', type: 'url', required: false, description: 'URL to the license terms' }
    ]
  },
  VideoObject: {
    type: 'VideoObject',
    label: 'Video Object',
    description: 'A video file or video content',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Video Title', type: 'text', required: true, description: 'The title of the video' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the video content' },
      { name: 'contentUrl', label: 'Video URL', type: 'url', required: false, description: 'Direct URL to the video file' },
      { name: 'embedUrl', label: 'Embed URL', type: 'url', required: false, description: 'URL for embedding the video player' },
      { name: 'thumbnailUrl', label: 'Thumbnail URL', type: 'url', required: false, description: 'URL to the video thumbnail image' },
      { name: 'duration', label: 'Duration', type: 'text', required: false, description: 'Duration in ISO 8601 format (e.g., PT10M30S)', placeholder: 'PT10M30S' },
      { name: 'width', label: 'Width', type: 'number', required: false, description: 'Width of the video in pixels' },
      { name: 'height', label: 'Height', type: 'number', required: false, description: 'Height of the video in pixels' },
      { name: 'encodingFormat', label: 'Format', type: 'text', required: false, description: 'Video format (e.g., MP4, WebM)', placeholder: 'video/mp4' },
      { name: 'creator', label: 'Creator', type: 'text', required: false, description: 'The creator of the video' },
      { name: 'datePublished', label: 'Published Date', type: 'date', required: false, description: 'When the video was published' }
    ]
  },
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
  Review: {
    type: 'Review',
    label: 'Review',
    description: 'A review of an item - for example, a restaurant, movie, or store',
    category: 'content',
    requiredProperties: ['name', 'reviewBody'],
    properties: [
      { name: 'name', label: 'Review Title', type: 'text', required: true, description: 'The title of the review' },
      { name: 'reviewBody', label: 'Review Content', type: 'textarea', required: true, description: 'The actual body of the review' },
      { name: 'author', label: 'Author', type: 'text', required: false, description: 'The author of the review' },
      { name: 'datePublished', label: 'Published Date', type: 'date', required: false, description: 'Date of first broadcast/publication' },
      { name: 'reviewRating', label: 'Rating', type: 'number', required: false, description: 'Rating given in the review (e.g., 1-5)', min: 1, max: 5 },
      { name: 'itemReviewed', label: 'Item Reviewed', type: 'text', required: false, description: 'The item that is being reviewed/rated' },
      { name: 'publisher', label: 'Publisher', type: 'text', required: false, description: 'The publisher of the review' },
      { name: 'url', label: 'Review URL', type: 'url', required: false, description: 'URL to the review page' }
    ]
  },
  CreativeWork: {
    type: 'CreativeWork',
    label: 'Creative Work',
    description: 'The most generic kind of creative work, including books, movies, photographs, software programs, etc.',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Title', type: 'text', required: true, description: 'The title of the creative work' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the creative work' },
      { name: 'author', label: 'Author/Creator', type: 'text', required: false, description: 'The author or creator of the work' },
      { name: 'dateCreated', label: 'Created Date', type: 'date', required: false, description: 'The date on which the CreativeWork was created' },
      { name: 'datePublished', label: 'Published Date', type: 'date', required: false, description: 'Date of first broadcast/publication' },
      { name: 'url', label: 'URL', type: 'url', required: false, description: 'URL of the item' },
      { name: 'keywords', label: 'Keywords', type: 'text', required: false, description: 'Keywords or tags used to describe this content' },
      { name: 'genre', label: 'Genre', type: 'text', required: false, description: 'Genre of the creative work, broadcast channel or group' },
      { name: 'license', label: 'License', type: 'url', required: false, description: 'A license document that applies to this content' },
      { name: 'copyrightHolder', label: 'Copyright Holder', type: 'text', required: false, description: 'The party holding the legal copyright to the CreativeWork' }
    ]
  },
  // CreativeWork More Specific Types
  Article: {
    type: 'Article',
    label: 'Article',
    description: 'An article, such as a news article or piece of investigative report',
    category: 'content',
    requiredProperties: ['headline', 'author'],
    properties: [
      { name: 'headline', label: 'Headline', type: 'text', required: true, description: 'Headline of the article' },
      { name: 'articleBody', label: 'Article Body', type: 'textarea', required: false, description: 'The actual body of the article' },
      { name: 'author', label: 'Author', type: 'text', required: true, description: 'The author of this content' },
      { name: 'datePublished', label: 'Published Date', type: 'date', required: false, description: 'Date of first publication' },
      { name: 'dateModified', label: 'Modified Date', type: 'date', required: false, description: 'The date on which the CreativeWork was most recently modified' },
      { name: 'publisher', label: 'Publisher', type: 'text', required: false, description: 'The publisher of the creative work' },
      { name: 'image', label: 'Featured Image URL', type: 'url', required: false, description: 'An image of the item' },
      { name: 'url', label: 'Article URL', type: 'url', required: false, description: 'URL of the article' },
      { name: 'keywords', label: 'Keywords', type: 'text', required: false, description: 'Keywords or tags used to describe this content' }
    ]
  },
  BlogPosting: {
    type: 'BlogPosting',
    label: 'Blog Posting',
    description: 'A blog post',
    category: 'content',
    requiredProperties: ['headline', 'author'],
    properties: [
      { name: 'headline', label: 'Title', type: 'text', required: true, description: 'The title of the blog post' },
      { name: 'articleBody', label: 'Content', type: 'textarea', required: false, description: 'The actual body of the article' },
      { name: 'author', label: 'Author', type: 'text', required: true, description: 'The author of the blog post' },
      { name: 'datePublished', label: 'Published Date', type: 'date', required: false, description: 'Date of first publication' },
      { name: 'dateModified', label: 'Modified Date', type: 'date', required: false, description: 'The date on which the CreativeWork was most recently modified' },
      { name: 'url', label: 'Post URL', type: 'url', required: false, description: 'URL of the blog post' },
      { name: 'image', label: 'Featured Image URL', type: 'url', required: false, description: 'An image of the item' },
      { name: 'keywords', label: 'Keywords', type: 'text', required: false, description: 'Keywords or tags used to describe this content' },
      { name: 'wordCount', label: 'Word Count', type: 'number', required: false, description: 'The number of words in the text of the Article' }
    ]
  },
  NewsArticle: {
    type: 'NewsArticle',
    label: 'News Article',
    description: 'A NewsArticle is an article whose content reports news, or provides background context and supporting materials for understanding the news',
    category: 'content',
    requiredProperties: ['headline', 'author'],
    properties: [
      { name: 'headline', label: 'Headline', type: 'text', required: true, description: 'Headline of the article' },
      { name: 'articleBody', label: 'Article Content', type: 'textarea', required: false, description: 'The actual body of the article' },
      { name: 'author', label: 'Author', type: 'text', required: true, description: 'The author of the article' },
      { name: 'datePublished', label: 'Published Date', type: 'date', required: false, description: 'Date of first publication' },
      { name: 'dateModified', label: 'Modified Date', type: 'date', required: false, description: 'The date on which the CreativeWork was most recently modified' },
      { name: 'publisher', label: 'Publisher', type: 'text', required: false, description: 'The publisher of the news article' },
      { name: 'url', label: 'Article URL', type: 'url', required: false, description: 'URL of the news article' },
      { name: 'image', label: 'Featured Image URL', type: 'url', required: false, description: 'An image of the item' },
      { name: 'dateline', label: 'Dateline', type: 'text', required: false, description: 'A dateline is a brief piece of text included in news articles' },
      { name: 'keywords', label: 'Keywords', type: 'text', required: false, description: 'Keywords or tags used to describe this content' }
    ]
  },
  Book: {
    type: 'Book',
    label: 'Book',
    description: 'A book',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Book Title', type: 'text', required: true, description: 'The title of the book' },
      { name: 'author', label: 'Author', type: 'text', required: false, description: 'The author of this content' },
      { name: 'isbn', label: 'ISBN', type: 'text', required: false, description: 'The ISBN of the book' },
      { name: 'publisher', label: 'Publisher', type: 'text', required: false, description: 'The publisher of the creative work' },
      { name: 'datePublished', label: 'Publication Date', type: 'date', required: false, description: 'Date of first publication' },
      { name: 'numberOfPages', label: 'Number of Pages', type: 'number', required: false, description: 'The number of pages in the book' },
      { name: 'bookFormat', label: 'Format', type: 'select', required: false, description: 'The format of the book',
        options: ['Hardcover', 'Paperback', 'EBook', 'AudioBook'] },
      { name: 'genre', label: 'Genre', type: 'text', required: false, description: 'Genre of the creative work' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the book' },
      { name: 'image', label: 'Cover Image URL', type: 'url', required: false, description: 'An image of the book cover' },
      { name: 'url', label: 'Book URL', type: 'url', required: false, description: 'URL of the book page' }
    ]
  },
  Movie: {
    type: 'Movie',
    label: 'Movie',
    description: 'A movie',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Movie Title', type: 'text', required: true, description: 'The title of the movie' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the movie' },
      { name: 'director', label: 'Director', type: 'text', required: false, description: 'The director of the movie' },
      { name: 'actor', label: 'Actors', type: 'textarea', required: false, description: 'Main actors (one per line)' },
      { name: 'datePublished', label: 'Release Date', type: 'date', required: false, description: 'The release date of the movie' },
      { name: 'duration', label: 'Duration', type: 'text', required: false, description: 'Duration in ISO 8601 format (e.g., PT2H30M)', placeholder: 'PT2H30M' },
      { name: 'genre', label: 'Genre', type: 'text', required: false, description: 'Genre of the movie' },
      { name: 'contentRating', label: 'Rating', type: 'select', required: false, description: 'Official rating of the movie',
        options: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR'] },
      { name: 'image', label: 'Poster URL', type: 'url', required: false, description: 'URL to the movie poster' },
      { name: 'trailer', label: 'Trailer URL', type: 'url', required: false, description: 'URL to the movie trailer' }
    ]
  },
  Course: {
    type: 'Course',
    label: 'Course',
    description: 'A description of an educational course which may be offered as distinct instances at which take place at different times or take place at different locations, or be delivered via different media or modes of study',
    category: 'educational',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Course Name', type: 'text', required: true, description: 'The title of the course' },
      { name: 'description', label: 'Course Description', type: 'textarea', required: false, description: 'A description of the course' },
      { name: 'provider', label: 'Course Provider', type: 'text', required: false, description: 'The service provider, service operator, or service performer' },
      { name: 'instructor', label: 'Instructor', type: 'text', required: false, description: 'A person assigned to instruct or provide instructional assistance for the CourseInstance' },
      { name: 'courseCode', label: 'Course Code', type: 'text', required: false, description: 'The identifier for the Course used by the course provider' },
      { name: 'educationalLevel', label: 'Educational Level', type: 'select', required: false, description: 'The level in terms of progression through an educational or training context',
        options: ['Beginner', 'Intermediate', 'Advanced', 'Professional'] },
      { name: 'timeRequired', label: 'Duration', type: 'text', required: false, description: 'Approximate or typical time it usually takes to work through this learning resource', placeholder: 'P4W (4 weeks)' },
      { name: 'url', label: 'Course URL', type: 'url', required: false, description: 'URL of the course' }
    ]
  },
  Recipe: {
    type: 'Recipe',
    label: 'Recipe',
    description: 'A recipe. For dietary restrictions covered by the recipe, a few common restrictions are enumerated via suitableForDiet',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Recipe Name', type: 'text', required: true, description: 'The name of the dish or recipe' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A short description of the recipe' },
      { name: 'author', label: 'Author/Chef', type: 'text', required: false, description: 'The author of this recipe' },
      { name: 'prepTime', label: 'Prep Time', type: 'text', required: false, description: 'The time it takes to prepare the ingredients', placeholder: 'PT15M (15 minutes)' },
      { name: 'cookTime', label: 'Cook Time', type: 'text', required: false, description: 'The time it takes to actually cook the dish', placeholder: 'PT30M (30 minutes)' },
      { name: 'totalTime', label: 'Total Time', type: 'text', required: false, description: 'The total time required to prepare and cook the recipe', placeholder: 'PT45M (45 minutes)' },
      { name: 'recipeYield', label: 'Servings', type: 'text', required: false, description: 'The quantity produced by the recipe (for example, number of people served)', placeholder: '4 servings' },
      { name: 'recipeIngredient', label: 'Ingredients', type: 'textarea', required: false, description: 'A single ingredient used in the recipe (one per line)' },
      { name: 'recipeInstructions', label: 'Instructions', type: 'textarea', required: false, description: 'A step-by-step cooking instruction' },
      { name: 'image', label: 'Recipe Image URL', type: 'url', required: false, description: 'An image of the dish' }
    ]
  },
  SoftwareApplication: {
    type: 'SoftwareApplication',
    label: 'Software Application',
    description: 'A software application',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Application Name', type: 'text', required: true, description: 'The name of the software application' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the software application' },
      { name: 'applicationCategory', label: 'Category', type: 'text', required: false, description: 'Type of software application (e.g., "Game", "Multimedia")' },
      { name: 'operatingSystem', label: 'Operating System', type: 'text', required: false, description: 'Operating systems supported', placeholder: 'Windows, macOS, Linux' },
      { name: 'softwareVersion', label: 'Version', type: 'text', required: false, description: 'Version of the software instance' },
      { name: 'author', label: 'Developer', type: 'text', required: false, description: 'The author/developer of this software' },
      { name: 'datePublished', label: 'Release Date', type: 'date', required: false, description: 'Date of first publication' },
      { name: 'downloadUrl', label: 'Download URL', type: 'url', required: false, description: 'If the file can be downloaded, URL to download the binary' },
      { name: 'fileSize', label: 'File Size', type: 'text', required: false, description: 'Size of the application download file', placeholder: '50MB' },
      { name: 'screenshot', label: 'Screenshot URL', type: 'url', required: false, description: 'A link to a screenshot image of the app' }
    ]
  },
  WebPage: {
    type: 'WebPage',
    label: 'Web Page',
    description: 'A web page. Every web page is implicitly assumed to be declared to be of type WebPage',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Page Title', type: 'text', required: true, description: 'The title of the web page' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A short description of the page' },
      { name: 'url', label: 'Page URL', type: 'url', required: false, description: 'URL of the page' },
      { name: 'author', label: 'Author', type: 'text', required: false, description: 'The author of this content' },
      { name: 'datePublished', label: 'Published Date', type: 'date', required: false, description: 'Date of first publication' },
      { name: 'dateModified', label: 'Modified Date', type: 'date', required: false, description: 'The date on which the CreativeWork was most recently modified' },
      { name: 'keywords', label: 'Keywords', type: 'text', required: false, description: 'Keywords or tags used to describe this content' },
      { name: 'breadcrumb', label: 'Breadcrumb', type: 'text', required: false, description: 'A set of links that can help a user understand and navigate a website hierarchy' }
    ]
  },
  TVSeries: {
    type: 'TVSeries',
    label: 'TV Series',
    description: 'CreativeWorkSeries dedicated to TV broadcast and associated online delivery',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Series Title', type: 'text', required: true, description: 'The title of the TV series' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the series' },
      { name: 'creator', label: 'Creator', type: 'text', required: false, description: 'The creator(s) of the series' },
      { name: 'actor', label: 'Main Actors', type: 'textarea', required: false, description: 'Main actors (one per line)' },
      { name: 'datePublished', label: 'First Aired', type: 'date', required: false, description: 'Date the series first aired' },
      { name: 'numberOfSeasons', label: 'Number of Seasons', type: 'number', required: false, description: 'The number of seasons in this series' },
      { name: 'numberOfEpisodes', label: 'Total Episodes', type: 'number', required: false, description: 'The number of episodes in this series' },
      { name: 'genre', label: 'Genre', type: 'text', required: false, description: 'Genre of the series' },
      { name: 'contentRating', label: 'Content Rating', type: 'select', required: false, description: 'The official rating for the series',
        options: ['TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'] },
      { name: 'image', label: 'Poster URL', type: 'url', required: false, description: 'URL to the series poster' }
    ]
  },
  MusicRecording: {
    type: 'MusicRecording',
    label: 'Music Recording',
    description: 'A music recording (track), usually a single song',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Song Title', type: 'text', required: true, description: 'The title of the song' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the recording' },
      { name: 'byArtist', label: 'Artist', type: 'text', required: false, description: 'The artist that performed this recording' },
      { name: 'inAlbum', label: 'Album', type: 'text', required: false, description: 'The album to which this recording belongs' },
      { name: 'duration', label: 'Duration', type: 'text', required: false, description: 'The duration of the track in ISO 8601 format', placeholder: 'PT3M30S' },
      { name: 'datePublished', label: 'Release Date', type: 'date', required: false, description: 'The date the recording was released' },
      { name: 'genre', label: 'Genre', type: 'text', required: false, description: 'Genre of the music' },
      { name: 'recordLabel', label: 'Record Label', type: 'text', required: false, description: 'The label that released the recording' },
      { name: 'isrcCode', label: 'ISRC Code', type: 'text', required: false, description: 'The International Standard Recording Code for the recording' },
      { name: 'audio', label: 'Audio URL', type: 'url', required: false, description: 'URL to the audio file' }
    ]
  },
  Photograph: {
    type: 'Photograph',
    label: 'Photograph',
    description: 'A photograph',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Photo Title', type: 'text', required: true, description: 'The title of the photograph' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the photograph' },
      { name: 'creator', label: 'Photographer', type: 'text', required: false, description: 'The photographer who took this photo' },
      { name: 'dateCreated', label: 'Date Taken', type: 'date', required: false, description: 'When the photograph was taken' },
      { name: 'locationCreated', label: 'Location', type: 'text', required: false, description: 'Where the photograph was taken' },
      { name: 'contentUrl', label: 'Image URL', type: 'url', required: false, description: 'URL to the photograph file' },
      { name: 'width', label: 'Width', type: 'number', required: false, description: 'Width of the image in pixels' },
      { name: 'height', label: 'Height', type: 'number', required: false, description: 'Height of the image in pixels' },
      { name: 'copyrightHolder', label: 'Copyright Holder', type: 'text', required: false, description: 'The party holding the legal copyright' },
      { name: 'license', label: 'License', type: 'url', required: false, description: 'A license document that applies to this content' }
    ]
  },
  Painting: {
    type: 'Painting',
    label: 'Painting',
    description: 'A painting',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Painting Title', type: 'text', required: true, description: 'The title of the painting' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the painting' },
      { name: 'creator', label: 'Artist', type: 'text', required: false, description: 'The artist who created this painting' },
      { name: 'dateCreated', label: 'Date Created', type: 'text', required: false, description: 'When the painting was created', placeholder: '1889 or circa 1889' },
      { name: 'artMedium', label: 'Medium', type: 'text', required: false, description: 'The material used (e.g., "oil on canvas")' },
      { name: 'width', label: 'Width', type: 'text', required: false, description: 'Width of the painting', placeholder: '73.7 cm' },
      { name: 'height', label: 'Height', type: 'text', required: false, description: 'Height of the painting', placeholder: '92.1 cm' },
      { name: 'artform', label: 'Art Form', type: 'text', required: false, description: 'The art form (e.g., "painting", "drawing")' },
      { name: 'image', label: 'Image URL', type: 'url', required: false, description: 'URL to an image of the painting' },
      { name: 'copyrightHolder', label: 'Copyright Holder', type: 'text', required: false, description: 'The party holding the legal copyright' }
    ]
  },
  Sculpture: {
    type: 'Sculpture',
    label: 'Sculpture',
    description: 'A piece of sculpture',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Sculpture Title', type: 'text', required: true, description: 'The title of the sculpture' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the sculpture' },
      { name: 'creator', label: 'Sculptor', type: 'text', required: false, description: 'The artist who created this sculpture' },
      { name: 'dateCreated', label: 'Date Created', type: 'text', required: false, description: 'When the sculpture was created', placeholder: '1504 or circa 1504' },
      { name: 'artMedium', label: 'Medium', type: 'text', required: false, description: 'The material used (e.g., "marble", "bronze")' },
      { name: 'width', label: 'Width', type: 'text', required: false, description: 'Width of the sculpture', placeholder: '51.0 cm' },
      { name: 'height', label: 'Height', type: 'text', required: false, description: 'Height of the sculpture', placeholder: '517.0 cm' },
      { name: 'depth', label: 'Depth', type: 'text', required: false, description: 'Depth of the sculpture', placeholder: '51.0 cm' },
      { name: 'artform', label: 'Art Form', type: 'text', required: false, description: 'The art form (e.g., "sculpture", "statue")' },
      { name: 'image', label: 'Image URL', type: 'url', required: false, description: 'URL to an image of the sculpture' }
    ]
  },
  WebSite: {
    type: 'WebSite',
    label: 'Web Site',
    description: 'A WebSite is a set of related web pages and other items typically served from a single web domain',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Website Name', type: 'text', required: true, description: 'The name of the website' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the website' },
      { name: 'url', label: 'Website URL', type: 'url', required: false, description: 'The URL of the website' },
      { name: 'author', label: 'Author/Owner', type: 'text', required: false, description: 'The author or owner of the website' },
      { name: 'publisher', label: 'Publisher', type: 'text', required: false, description: 'The publisher of the website' },
      { name: 'datePublished', label: 'Launch Date', type: 'date', required: false, description: 'When the website was launched' },
      { name: 'keywords', label: 'Keywords', type: 'text', required: false, description: 'Keywords that describe the website' },
      { name: 'inLanguage', label: 'Language', type: 'text', required: false, description: 'The language of the content', placeholder: 'en-US' }
    ]
  },
  HowTo: {
    type: 'HowTo',
    label: 'How To',
    description: 'Instructions that explain how to achieve a result by performing a sequence of steps',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'How-To Title', type: 'text', required: true, description: 'The title of the how-to guide' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of what will be accomplished' },
      { name: 'author', label: 'Author', type: 'text', required: false, description: 'The author of the how-to guide' },
      { name: 'totalTime', label: 'Total Time', type: 'text', required: false, description: 'The total time required', placeholder: 'PT30M (30 minutes)' },
      { name: 'tool', label: 'Tools Needed', type: 'textarea', required: false, description: 'Tools or equipment needed (one per line)' },
      { name: 'supply', label: 'Supplies Needed', type: 'textarea', required: false, description: 'Supplies or materials needed (one per line)' },
      { name: 'step', label: 'Instructions', type: 'textarea', required: false, description: 'Step-by-step instructions' },
      { name: 'image', label: 'Guide Image URL', type: 'url', required: false, description: 'An image for the how-to guide' },
      { name: 'video', label: 'Video URL', type: 'url', required: false, description: 'A video showing the process' }
    ]
  },
  Game: {
    type: 'Game',
    label: 'Game',
    description: 'The Game type represents things which are games. These are typically rule-governed recreational activities',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Game Title', type: 'text', required: true, description: 'The title of the game' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the game' },
      { name: 'creator', label: 'Creator/Developer', type: 'text', required: false, description: 'The creator or developer of the game' },
      { name: 'publisher', label: 'Publisher', type: 'text', required: false, description: 'The publisher of the game' },
      { name: 'datePublished', label: 'Release Date', type: 'date', required: false, description: 'When the game was released' },
      { name: 'genre', label: 'Genre', type: 'text', required: false, description: 'The genre of the game' },
      { name: 'gamePlatform', label: 'Platform', type: 'text', required: false, description: 'The platform(s) the game runs on', placeholder: 'PC, PlayStation, Xbox' },
      { name: 'numberOfPlayers', label: 'Number of Players', type: 'text', required: false, description: 'Number of players supported', placeholder: '1-4 players' },
      { name: 'contentRating', label: 'Content Rating', type: 'select', required: false, description: 'The official content rating',
        options: ['E', 'T', 'M', 'AO'] },
      { name: 'image', label: 'Game Image URL', type: 'url', required: false, description: 'An image of the game' }
    ]
  },
  Dataset: {
    type: 'Dataset',
    label: 'Dataset',
    description: 'A body of structured information describing some topic(s) of interest',
    category: 'content',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Dataset Name', type: 'text', required: true, description: 'The name of the dataset' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the dataset' },
      { name: 'creator', label: 'Creator', type: 'text', required: false, description: 'The creator of the dataset' },
      { name: 'dateCreated', label: 'Created Date', type: 'date', required: false, description: 'The date on which the dataset was created' },
      { name: 'dateModified', label: 'Modified Date', type: 'date', required: false, description: 'The date on which the dataset was most recently modified' },
      { name: 'datePublished', label: 'Published Date', type: 'date', required: false, description: 'Date of first broadcast/publication' },
      { name: 'version', label: 'Version', type: 'text', required: false, description: 'The version of the dataset' },
      { name: 'license', label: 'License', type: 'url', required: false, description: 'A license document that applies to this content' },
      { name: 'keywords', label: 'Keywords', type: 'text', required: false, description: 'Keywords or tags used to describe this content' },
      { name: 'url', label: 'Dataset URL', type: 'url', required: false, description: 'URL where the dataset can be accessed' }
    ]
  },
  ScholarlyArticle: {
    type: 'ScholarlyArticle',
    label: 'Scholarly Article',
    description: 'A scholarly article published in an academic journal or conference',
    category: 'content',
    requiredProperties: ['headline'],
    properties: [
      { name: 'headline', label: 'Title', type: 'text', required: true, description: 'The title of the article' },
      { name: 'abstract', label: 'Abstract', type: 'textarea', required: false, description: 'The abstract or summary of the article' },
      { name: 'author', label: 'Authors', type: 'textarea', required: false, description: 'The authors of the article (one per line)' },
      { name: 'datePublished', label: 'Published Date', type: 'date', required: false, description: 'Date of publication' },
      { name: 'identifier', label: 'DOI', type: 'text', required: false, description: 'The DOI or other identifier', placeholder: '10.1000/xyz123' },
      { name: 'isPartOf', label: 'Journal/Publication', type: 'text', required: false, description: 'The journal or publication this appeared in' },
      { name: 'keywords', label: 'Keywords', type: 'text', required: false, description: 'Keywords or tags' },
      { name: 'about', label: 'Subject Areas', type: 'text', required: false, description: 'Subject areas or topics covered' }
    ]
  },
  // Event Subtypes
  BusinessEvent: {
    type: 'BusinessEvent',
    label: 'Business Event',
    description: 'A business event such as a conference, meeting, or trade show',
    category: 'event',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Event Name', type: 'text', required: true, description: 'The name of the business event' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the event' },
      { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false, description: 'When the event starts' },
      { name: 'endDate', label: 'End Date', type: 'datetime-local', required: false, description: 'When the event ends' },
      { name: 'location', label: 'Location', type: 'text', required: false, description: 'Where the event takes place' },
      { name: 'organizer', label: 'Organizer', type: 'text', required: false, description: 'Who is organizing the event' },
      { name: 'url', label: 'Event Website', type: 'url', required: false, description: 'Website with event information' }
    ]
  },
  MusicEvent: {
    type: 'MusicEvent',
    label: 'Music Event',
    description: 'A music event such as a concert or music festival',
    category: 'event',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Event Name', type: 'text', required: true, description: 'The name of the music event' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the event' },
      { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false, description: 'When the event starts' },
      { name: 'endDate', label: 'End Date', type: 'datetime-local', required: false, description: 'When the event ends' },
      { name: 'location', label: 'Venue', type: 'text', required: false, description: 'The venue or location' },
      { name: 'performer', label: 'Performers', type: 'textarea', required: false, description: 'Artists or performers (one per line)' },
      { name: 'url', label: 'Event Website', type: 'url', required: false, description: 'Website with event information' }
    ]
  },
  // Organization Subtypes
  Corporation: {
    type: 'Corporation',
    label: 'Corporation',
    description: 'A business corporation or company',
    category: 'organization',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Company Name', type: 'text', required: true, description: 'The name of the corporation' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the company' },
      { name: 'foundingDate', label: 'Founded Date', type: 'date', required: false, description: 'When the company was founded' },
      { name: 'founder', label: 'Founder(s)', type: 'text', required: false, description: 'The founder(s) of the company' },
      { name: 'address', label: 'Address', type: 'textarea', required: false, description: 'The company address' },
      { name: 'url', label: 'Website', type: 'url', required: false, description: 'The company website' },
      { name: 'email', label: 'Email', type: 'email', required: false, description: 'Contact email address' },
      { name: 'telephone', label: 'Phone', type: 'tel', required: false, description: 'Contact phone number' }
    ]
  },
  EducationalOrganization: {
    type: 'EducationalOrganization',
    label: 'Educational Organization',
    description: 'A school, university, or other educational institution',
    category: 'organization',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Institution Name', type: 'text', required: true, description: 'The name of the educational institution' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, description: 'A description of the institution' },
      { name: 'foundingDate', label: 'Founded Date', type: 'date', required: false, description: 'When the institution was founded' },
      { name: 'address', label: 'Address', type: 'textarea', required: false, description: 'The institution address' },
      { name: 'url', label: 'Website', type: 'url', required: false, description: 'The institution website' },
      { name: 'email', label: 'Email', type: 'email', required: false, description: 'Contact email address' },
      { name: 'telephone', label: 'Phone', type: 'tel', required: false, description: 'Contact phone number' }
    ]
  },
  // Person Subtypes
  Patient: {
    type: 'Patient',
    label: 'Patient',
    description: 'A person receiving medical care',
    category: 'person',
    requiredProperties: ['name'],
    properties: [
      { name: 'name', label: 'Full Name', type: 'text', required: true, description: 'The full name of the patient' },
      { name: 'givenName', label: 'First Name', type: 'text', required: false, description: 'The first name' },
      { name: 'familyName', label: 'Last Name', type: 'text', required: false, description: 'The last name' },
      { name: 'birthDate', label: 'Birth Date', type: 'date', required: false, description: 'Date of birth' },
      { name: 'gender', label: 'Gender', type: 'select', required: false, description: 'Gender identity', options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
      { name: 'address', label: 'Address', type: 'textarea', required: false, description: 'Home address' },
      { name: 'email', label: 'Email', type: 'email', required: false, description: 'Email address' },
      { name: 'telephone', label: 'Phone', type: 'tel', required: false, description: 'Phone number' }
    ]
  },
  // Additional Event Subtypes (with basic definitions)
  ChildrensEvent: { type: 'ChildrensEvent', label: 'Children\'s Event', description: 'Events designed for children', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'location', label: 'Location', type: 'text', required: false }] },
  ComedyEvent: { type: 'ComedyEvent', label: 'Comedy Event', description: 'Comedy shows and performances', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'location', label: 'Location', type: 'text', required: false }] },
  CourseInstance: { type: 'CourseInstance', label: 'Course Instance', description: 'A specific instance of a course', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Course Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'instructor', label: 'Instructor', type: 'text', required: false }] },
  DanceEvent: { type: 'DanceEvent', label: 'Dance Event', description: 'Dance performances and classes', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'location', label: 'Location', type: 'text', required: false }] },
  DeliveryEvent: { type: 'DeliveryEvent', label: 'Delivery Event', description: 'Package or service delivery', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Delivery Description', type: 'text', required: true }, { name: 'hasDeliveryMethod', label: 'Delivery Method', type: 'text', required: false }, { name: 'deliveryAddress', label: 'Delivery Address', type: 'textarea', required: false }] },
  EducationEvent: { type: 'EducationEvent', label: 'Education Event', description: 'Educational workshops and seminars', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'educationalLevel', label: 'Educational Level', type: 'text', required: false }] },
  ExhibitionEvent: { type: 'ExhibitionEvent', label: 'Exhibition Event', description: 'Art shows and museum exhibitions', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Exhibition Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'location', label: 'Location', type: 'text', required: false }] },
  Festival: { type: 'Festival', label: 'Festival', description: 'Cultural festivals and celebrations', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Festival Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'location', label: 'Location', type: 'text', required: false }] },
  FoodEvent: { type: 'FoodEvent', label: 'Food Event', description: 'Food tastings and cooking classes', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'location', label: 'Location', type: 'text', required: false }] },
  LiteraryEvent: { type: 'LiteraryEvent', label: 'Literary Event', description: 'Book readings and poetry events', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'location', label: 'Location', type: 'text', required: false }] },
  PublicationEvent: { type: 'PublicationEvent', label: 'Publication Event', description: 'Book launches and publication releases', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'publishedBy', label: 'Publisher', type: 'text', required: false }] },
  SaleEvent: { type: 'SaleEvent', label: 'Sale Event', description: 'Sales, promotions, and discounts', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Sale Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'validFrom', label: 'Valid From', type: 'datetime-local', required: false }] },
  ScreeningEvent: { type: 'ScreeningEvent', label: 'Screening Event', description: 'Movie screenings and film festivals', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'location', label: 'Location', type: 'text', required: false }] },
  SocialEvent: { type: 'SocialEvent', label: 'Social Event', description: 'Parties and social gatherings', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'location', label: 'Location', type: 'text', required: false }] },
  SportsEvent: { type: 'SportsEvent', label: 'Sports Event', description: 'Sports games and competitions', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'sport', label: 'Sport', type: 'text', required: false }] },
  TheaterEvent: { type: 'TheaterEvent', label: 'Theater Event', description: 'Plays and theatrical performances', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'location', label: 'Theater/Venue', type: 'text', required: false }] },
  VisualArtsEvent: { type: 'VisualArtsEvent', label: 'Visual Arts Event', description: 'Art exhibitions and gallery openings', category: 'event', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Event Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'startDate', label: 'Start Date', type: 'datetime-local', required: false }, { name: 'location', label: 'Gallery/Venue', type: 'text', required: false }] },
  // Additional Organization Subtypes (with basic definitions)
  GovernmentOrganization: { type: 'GovernmentOrganization', label: 'Government Organization', description: 'Government agencies and departments', category: 'organization', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Agency Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'address', label: 'Address', type: 'textarea', required: false }, { name: 'url', label: 'Website', type: 'url', required: false }] },
  LibrarySystem: { type: 'LibrarySystem', label: 'Library System', description: 'Libraries and library networks', category: 'organization', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Library Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'address', label: 'Address', type: 'textarea', required: false }, { name: 'url', label: 'Website', type: 'url', required: false }] },
  LocalBusiness: { type: 'LocalBusiness', label: 'Local Business', description: 'Local shops, restaurants, and services', category: 'organization', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Business Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'address', label: 'Address', type: 'textarea', required: false }, { name: 'telephone', label: 'Phone', type: 'tel', required: false }] },
  MedicalOrganization: { type: 'MedicalOrganization', label: 'Medical Organization', description: 'Hospitals, clinics, and medical practices', category: 'organization', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Organization Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'address', label: 'Address', type: 'textarea', required: false }, { name: 'telephone', label: 'Phone', type: 'tel', required: false }] },
  NewsMediaOrganization: { type: 'NewsMediaOrganization', label: 'News Media Organization', description: 'News outlets and journalism organizations', category: 'organization', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Organization Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'url', label: 'Website', type: 'url', required: false }] },
  NGO: { type: 'NGO', label: 'Non-Governmental Organization', description: 'Non-profit organizations and NGOs', category: 'organization', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Organization Name', type: 'text', required: true }, { name: 'description', label: 'Mission/Description', type: 'textarea', required: false }, { name: 'url', label: 'Website', type: 'url', required: false }] },
  PerformingGroup: { type: 'PerformingGroup', label: 'Performing Group', description: 'Bands, theater groups, and dance companies', category: 'organization', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Group Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'genre', label: 'Genre/Style', type: 'text', required: false }] },
  ResearchOrganization: { type: 'ResearchOrganization', label: 'Research Organization', description: 'Research institutes and labs', category: 'organization', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Organization Name', type: 'text', required: true }, { name: 'description', label: 'Research Focus', type: 'textarea', required: false }, { name: 'url', label: 'Website', type: 'url', required: false }] },
  SportsOrganization: { type: 'SportsOrganization', label: 'Sports Organization', description: 'Sports teams, leagues, and associations', category: 'organization', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Organization Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'sport', label: 'Sport', type: 'text', required: false }] },
  WorkersUnion: { type: 'WorkersUnion', label: 'Workers Union', description: 'Labor unions and worker organizations', category: 'organization', requiredProperties: ['name'], properties: [{ name: 'name', label: 'Union Name', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'foundingDate', label: 'Founded Date', type: 'date', required: false }] }
}
