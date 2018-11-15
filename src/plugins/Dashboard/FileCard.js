const getFileTypeIcon = require('./getFileTypeIcon')
const FilePreview = require('./FilePreview')
const { h, Component } = require('preact')

module.exports = class FileCard extends Component {
  constructor (props) {
    super(props)

    this.meta = {}

    this.tempStoreMetaOrSubmit = this.tempStoreMetaOrSubmit.bind(this)
    this.renderMetaFields = this.renderMetaFields.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  tempStoreMetaOrSubmit (ev) {
    const file = this.props.files[this.props.fileCardFor]

    if (ev.keyCode === 13) {
      ev.stopPropagation()
      ev.preventDefault()
      this.props.saveFileCard(this.meta, file.id)
      return
    }

    const value = ev.target.value
    const name = ev.target.dataset.name
    this.meta[name] = value
  }

  renderMetaFields (file) {
    let meta = []
    let me = this
    let metaFields = this.props.metaFields || []

    metaFields.forEach((field) => {
      let selected = file.meta[field.id]
      if (field.type === 'toggle') {
        meta.push(<div class="uppy-DashboardFileCard-fieldset uppy-toggle-field">
          <div className={'uppy-toggle-label'}>
            <label class="uppy-DashboardFileCard-label">{field.name}</label>
          </div>
          <div className={'uppy-toggle'}>
            {selected
            ? <input type="checkbox" id={field.id}
              onClick={(e) => {
                me.meta[field.id] = e.target.checked
              }}
              checked />
              : <input type="checkbox" id={field.id}
                onClick={(e) => {
                  console.log(file)
                  me.meta[field.id] = e.target.checked
                }}
              />
            }
            <label for={field.id}>Toggle</label>
          </div>
        </div>)
      } else {
        meta.push(<fieldset class="uppy-DashboardFileCard-fieldset">
          <label class="uppy-DashboardFileCard-label">{field.name}</label>
          <input class="uppy-c-textInput uppy-DashboardFileCard-input"
            type="text"
            data-name={field.id}
            value={file.meta[field.id]}
            placeholder={field.placeholder}
            onkeyup={this.tempStoreMetaOrSubmit}
            onkeydown={this.tempStoreMetaOrSubmit}
            onkeypress={this.tempStoreMetaOrSubmit} /></fieldset>)
      }
    })
    return meta
  }

  handleSave (ev) {
    const fileID = this.props.fileCardFor
    this.props.saveFileCard(this.meta, fileID)
  }

  handleCancel (ev) {
    this.meta = {}
    this.props.toggleFileCard()
  }

  render () {
    if (!this.props.fileCardFor) {
      return <div class="uppy-DashboardFileCard" aria-hidden />
    }

    const file = this.props.files[this.props.fileCardFor]

    return (
      <div class="uppy-DashboardFileCard" aria-hidden={!this.props.fileCardFor}>
        <div style={{ width: '100%', height: '100%' }}>
          <div class="uppy-DashboardContent-bar">
            <div class="uppy-DashboardContent-title" role="heading" aria-level="h1">
              {this.props.i18nArray('editing', {
                file: <span class="uppy-DashboardContent-titleFile">{file.meta ? file.meta.name : file.name}</span>
              })}
            </div>
            <button class="uppy-DashboardContent-back" type="button" title={this.props.i18n('finishEditingFile')}
              onclick={this.handleSave}>{this.props.i18n('done')}</button>
          </div>

          <div class="uppy-DashboardFileCard-inner">
            <div class="uppy-DashboardFileCard-preview" style={{ backgroundColor: getFileTypeIcon(file.type).color }}>
              <FilePreview file={file} />
            </div>

            <div class="uppy-DashboardFileCard-info">
              {this.renderMetaFields(file)}
            </div>

            <div class="uppy-Dashboard-actions">
              <button class="uppy-u-reset uppy-c-btn uppy-c-btn-primary uppy-Dashboard-actionsBtn"
                type="button"
                onclick={this.handleSave}>{this.props.i18n('saveChanges')}</button>
              <button class="uppy-u-reset uppy-c-btn uppy-c-btn-link uppy-Dashboard-actionsBtn"
                type="button"
                onclick={this.handleCancel}>{this.props.i18n('cancel')}</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
