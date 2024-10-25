# Extend project interface

Project interface consists of 3 key elements:
- Project edit form
- Project listing
- Project filter form

These interfaces built on top of following contrib libraries:
- [Formik](https://formik.org/docs/tutorial): used to build forms. It provides form API with validation & error message, form submission and many others. 
- [TanStack Table](https://tanstack.com/table/latest): used to build tables. Provides API for table pagination and sorting.
- [Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/): used for the project layout and base elements styles (bootstrap styles only). 

## Icons management

All icons in the project are font-icons which were generated using the [Icomoon](https://icomoon.io/app/) service.

### Add icons from the project to the service

To get a visual representation of the icons, you need:
1. Go to the site and click `Import icons`.
2. In dialog choose all files from [f-icons](/app/client/src/f-icons) directory.
3. Click open.

You will see all available icons in the project.

### Add new icon to the service

There are several ways of adding icons to the font:
- **Simple**
  1. Select one of the free icons available in the [Icomoon](https://icomoon.io/app/#/select) service.
- **Advanced**:
  1. Create new icon in Adobe Illustrator, Sketch or any other vector editor.
  2. Save it as SVG.
  3. Add icon to the existing set: by simple Drag&Drop, or click 'burger menu icon' (top right corner) and choose `Import to set`.
  4. Select icon in the set (it's not selected by default).

**Note:** To make sure all the icons are the same, since this is a font, the **size** of one icon is **100x100px**.

### Add set of icons from the service to the project

1. After the steps above click `Generate font`.
2. On the generation page you will see the list of icons along with their names and codes, they will be used in the project.
3. Download and un-archive the set.
4. Replace the `general-icons.woff` and `selection.json` files in the [f-icons](/app/client/src/f-icons) folder with the new downloaded files.
5. Add new icon to the [_icons.scss](/app/client/src/scss/abstract/_icons.scss)
   ```scss
   $font-icons: (
     // ...other icons
     awesome-icon: '\e92c', // new icon
   );
   ```
6. Create icon element in the JSX template:
   ```jsx
   // template: "font-icon-{icon}", where {icon} - the name of icon in scss (above).
   <i className="font-icon-awesome-icon" />
   ```

## Available form elements

List of available form elements that can be used with formik can be found on the ["/examples"](/app/client/src/components/Examples/FormikForm.tsx):
- Text
- Email
- Password
- Number
- Select
- Radio
- Checkboxes
- Textarea
- File upload

Bellow example shows, how we can extend project interface with a new field called "Calculated value" and add it to the:

- project form - to allow this field to be changed from the UI
- project listing - add new sortable column
- project filter - add an ability to filter project list by "Calculated value" column.

Pre-requirements: `calculated_value` column was added to the Flask application, as described in [tutorial](../model)

## Extend project interface with a new property

We need to make sure that project model and project list models on the client are aware of the new field that was added in the BE.
Let's add the new field to the [Project.ModelBase interface](/app/client/src/models/Project/types.d.ts):

```typescript
interface ModelBase extends ModelBaseDefinition {
  readonly title: string;
  readonly status?: Status;
  readonly calculated_value: string | null;
}
```

We need to make sure that project [model](/app/client/src/models/Project/ProjectModel.ts) initial values is also updated as this property is not optional:

```typescript
export class ProjectModel extends BaseModel<Project.Model, Project.ModelListItem, Project.Filters> {
  // Existing methods and properties...
  emptyModel: Project.Model = {
    title: '',
    description: '',
    calculated_value: '',
  };
  // Existing methods and properties...
}
```

Run code linter to make sure that there is no errors connected to the newly added property:

SSH to the `client` container:

```shell
slw bash client
```

Execute the lint command:

```shell
npm run lint
```

If there are errors connected to the new property inside the tests mocks - update them to include new property.

## Project form - add new field

Let's add calculated value field to project create/edit [form](/app/client/src/models/Project/pages/components/ProjectUpsertForm.tsx).

```typescript jsx
return (
  //...other elements
  <FormItem<typeof InputField>
    name="calculated_value"
    label={t('Calculated value')}
    placeholder={t('Enter project calculated value')}
    component={InputField}
    readOnly={!canBeEdited}
    disabled={isSubmitting}
  />
  //...rest of the form
)
```

## Project list - add new column

Add calculated value field to the projects list [page](/app/client/src/models/Project/pages/ProjectsListPage/ProjectsListPage.tsx).

```typescript jsx
// ... Other component code 
const columns: ColumnDef<Project.ModelListItem>[] = [
  // Other columns definitions
  {
    accessorKey: 'calculated_value',
    header: t('Calculated value'),
  },
  // Other columns definitions
]
```

## Project Filter form - add new filter

Add calculated value filter to the projects filter form [page](/app/client/src/models/Project/pages/ProjectsListPage/ProjectsListFiltersForm.tsx).

```typescript jsx
  ...
  const formik = useFormik({ 
  ...config, 
  initialValues: {
    title_filter: '',
    status_filter: '',
    author_filter: '',
    created_from_filter: '',
    calculated_value_filter: '',
    ...filters,
  },
  ...
  return (
   ...
    <CollapsibleContent ...>
     <div className="form-filters__item-small">
        <FormItem<typeof InputField>
          id='calculated_value_filter'
          label={t('Calculated value')}
          placeholder={t('Search by calculated value')}
          component={InputField}
          disabled={isLoading}
        />
      </div>
    </CollapsibleContent>
    ...
```

There are a few things to note:
- Filter identifier should always have `_filter` suffix.
- Application out of the box supports only string filters, see the restful [section](../restful) on how to implement other field types.
