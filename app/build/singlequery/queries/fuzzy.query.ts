import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from "@angular/core";
import { EditableComponent } from '../../editable/editable.component';

@Component({
	selector: 'fuzzy-query',
	template: 	`<span class="col-xs-6 pd-l0">
					<div class="form-group form-element">
						<input type="text" class="form-control col-xs-12"
							[(ngModel)]="inputs.input.value" 
						 	placeholder="{{inputs.input.placeholder}}"
						 	(keyup)="getFormat();" />
					</div>
					<button (click)="addOption();" class="btn btn-info btn-xs add-option"> <i class="fa fa-plus"></i> </button>
				</span>
				<div class="col-xs-12 option-container" *ngIf="optionRows.length">
					<div class="col-xs-12 single-option" *ngFor="let singleOption of optionRows, let i=index">
						<div class="col-xs-6 pd-l0">			
							<editable 
								class = "additional-option-select-{{i}}"
								[editableField]="singleOption.name" 
								[editPlaceholder]="'--choose option--'"
								[editableInput]="'select2'" 
								[selectOption]="options" 
								[passWithCallback]="i"
								[selector]="'additional-option-select'" 
								[querySelector]="querySelector"
								[informationList]="informationList"
								[showInfoFlag]="true"
								[searchOff]="true"
								(callback)="selectOption($event)">
							</editable>
						</div>
						<div class="col-xs-6 pd-0">
							<div class="form-group form-element">
								<input class="form-control col-xs-12 pd-0" type="text" [(ngModel)]="singleOption.value" placeholder="value"  (keyup)="getFormat();"/>
							</div>
						</div>
						<button (click)="removeOption(i)" class="btn btn-grey delete-option btn-xs">
							<i class="fa fa-times"></i>
						</button>
					</div>
				</div>`,
	inputs: ['appliedQuery', 'queryList', 'selectedQuery', 'selectedField','getQueryFormat', 'querySelector'],
	directives: [EditableComponent]
})

export class FuzzyQuery implements OnInit, OnChanges {
	@Input() queryList;
	@Input() selectedField;
	@Input() appliedQuery;
	@Input() selectedQuery;
	@Output() getQueryFormat = new EventEmitter<any>();
	public current_query = 'fuzzy';
	public queryName = '*';
	public fieldName = '*';
	public information: any = {
		title: 'fuzzy query',
		content: `<span class="description"> fuzzy query content </span>
					<a class="link" href="https://www.elastic.co/guide/en/elasticsearch/reference/2.3/query-dsl-missing-query.html">Documentation</a>`
	};
	public informationList: any = {
		'boost': {
			title: 'Operator',
			content: `<span class="description"> Operator content </span>`	
		},
		'fuzziness': {
			title: 'zero_terms',
			content: `<span class="description"> zero_terms content </span>`	
		},
		'prefix_length': {
			title: 'zero_terms',
			content: `<span class="description"> zero_terms content </span>`	
		},
		'max_expansions': {
			title: 'zero_terms',
			content: `<span class="description"> zero_terms content </span>`	
		}
	};
	public options: any = [
		'boost',
		'fuzziness',
		'prefix_length',
		'max_expansions'
	];
	public singleOption = {
		name: '',
		value: ''
	};
	public optionRows: any = []
	
	
	public inputs: any = {
		input: {
			placeholder: 'Input',
			value: ''
		}
	};
	public queryFormat: any = {};

	ngOnInit() {
		try {
			if(this.appliedQuery[this.current_query][this.fieldName]) {
				if (this.appliedQuery[this.current_query][this.fieldName].value) {
					this.inputs.input.value = this.appliedQuery[this.current_query][this.fieldName].value;
					for (let option in this.appliedQuery[this.current_query][this.fieldName]) {
						if (option != 'value') {
							var obj = {
								name: option,
								value: this.appliedQuery[this.current_query][this.fieldName][option]
							};
							this.optionRows.push(obj);
						}
					}
				} else {
					this.inputs.input.value = this.appliedQuery[this.current_query][this.fieldName];
				}
			}
		} catch(e) {}
		this.getFormat();
	}

	ngOnChanges() {
		if(this.selectedField != '') {
			if(this.selectedField !== this.fieldName) {
				this.fieldName = this.selectedField;
				this.getFormat();
			}
		}
		if(this.selectedQuery != '') {
			if(this.selectedQuery !== this.queryName) {
				this.queryName = this.selectedQuery;
				this.optionRows = [];
				this.getFormat();
			}
		}
	}
	// QUERY FORMAT
	/*
		Query Format for this query is
		@queryName: {
			@fieldName: @value
		}
	*/
	getFormat() {
		if (this.queryName === this.current_query) {
			this.queryFormat = this.setFormat();
			this.getQueryFormat.emit(this.queryFormat);
		}
	}
	setFormat() {
		var queryFormat = {};
		queryFormat[this.queryName] = {};
		if (this.optionRows.length) {
			queryFormat[this.queryName][this.fieldName] = {
				value: this.inputs.input.value
			};
			this.optionRows.forEach(function(singleRow: any) {
				queryFormat[this.queryName][this.fieldName][singleRow.name] = singleRow.value;
			}.bind(this))
		} else {
			queryFormat[this.queryName][this.fieldName] = this.inputs.input.value;
		}
		return queryFormat;
	}
	selectOption(input: any) {
		input.selector.parents('.editable-pack').removeClass('on');
		this.optionRows[input.external].name = input.val;
		setTimeout(function() {
			this.getFormat();
		}.bind(this), 300);
	}
	addOption() {
		var singleOption = JSON.parse(JSON.stringify(this.singleOption));
		this.optionRows.push(singleOption);
	}
	removeOption(index: Number) {
		this.optionRows.splice(index, 1);
		this.getFormat();
	}

}
