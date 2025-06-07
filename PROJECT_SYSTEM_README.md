# Project-Based Recruitment System

## Overview

The new project-based recruitment system allows HR managers to create multiple recruitment projects, each with its own customized assessment configuration and candidate management.

## Key Features

### 1. Project Creation
- **Multi-step form** with 4 comprehensive steps:
  - **Basic Info**: Project name, description, position, department
  - **Role Details**: Experience level, location, work mode, team size, industry
  - **Team & Culture**: Management style, key skills, company values
  - **Assessment**: Role challenges and preferred assessment games

### 2. Intelligent Recommendations
- Automatically suggests assessment games based on role requirements
- Customizes focus areas based on experience level and management style
- Adjusts assessment duration based on role complexity

### 3. Project Dashboard
- Individual dashboard for each project
- Project overview with all role and customization details
- Candidate management scoped to the specific project
- Real-time statistics tracking

### 4. Projects Overview
- Central hub to manage all recruitment projects
- Project cards with key information and statistics
- Filter projects by status (active, paused, completed)
- Quick access to individual project dashboards

## Navigation Structure

```
/hr                          → Projects Overview (main page)
/hr/projects                 → Projects Overview (alias)
/hr/projects/new            → Project Creation Form
/hr/projects/:projectId     → Individual Project Dashboard
/hr/dashboard               → Legacy dashboard (for backwards compatibility)
```

## Data Structure

### Project Model
- **Basic Info**: Name, description, company association
- **Role Information**: Position details, requirements, work arrangements
- **Customization**: Team dynamics, culture values, key skills
- **Recommendations**: AI-suggested games, focus areas, questions
- **Statistics**: Real-time candidate tracking

### Project Candidates
- Scoped to individual projects
- Extends existing candidate model with project association
- Maintains all existing functionality (invite, track, results)

## Technical Implementation

### Components
- `ProjectsOverview`: Main projects management page
- `ProjectCreation`: Multi-step project creation form
- `ProjectDashboard`: Individual project dashboard
- Enhanced routing in `App.tsx`

### Database Structure
```
companies/
  {companyId}/
    projects/
      {projectId}/
        - project data
        candidates/
          {candidateId}/
            - candidate data
```

### Styling
- Extended existing HR styles (`hr.css`)
- Responsive design for all screen sizes
- Consistent design language with existing dashboard

## Benefits

1. **Better Organization**: Separate candidates by recruitment project
2. **Customization**: Tailored assessments for each role
3. **Scalability**: Support for multiple concurrent recruitment projects
4. **Better Insights**: Project-specific analytics and reporting
5. **Improved UX**: Clear separation of concerns and intuitive navigation

## Future Enhancements

- Advanced analytics and reporting per project
- Project templates for common roles
- Collaborative features for multiple HR managers
- Integration with ATS systems
- Advanced AI recommendations based on historical data

## Migration

The system maintains backward compatibility:
- Existing `/hr/dashboard` route still works
- All existing candidate data remains accessible
- Gradual migration path to project-based system 