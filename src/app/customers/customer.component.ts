import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { Customer } from './Customer';
import { debounceTime, Subscription } from "rxjs";

function ratingRange (min: number, max: number): ValidatorFn {
    return (control: AbstractControl) => {
        const { value } = control
        if (value !== undefined && value !== null && value !== '' && (isNaN(value) || value < min || value > max)) {
            return { 'range': true }
        }
        return null
    }
}

function matchInputs (input: string, target: string): ValidatorFn {
    return (form: AbstractControl) => {
        if (form.value[input] !== form.value[target]) {
            return { match: true }
        }
        return null
    }
}

@Component({
    selector: 'app-customer',
    templateUrl: './customer.component.html',
    styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit, OnDestroy {
    customer = new Customer()

    subs: Subscription[] = []
    inputDelay = 700
    fieldMin = 3
    fieldMax = 30

    formMessages = {
        firstName: '',
        lastName: '',
        email: '',
        confirmEmail: '',
        matchEmails: '',
        phone: '',
        rating: ''
    }

    private validationMessages: { [p: string]: string } = {
        required: 'Required field.',
        minlength: 'Field must be longer than 3 characters',
        maxlength: 'Field must be less than 30 characters',
        email: 'Enter a valid email address.',
        match: "Emails don't match!",
        range: 'Rate your experience from 1 to 5'
    }

    customerForm = new FormGroup({
        firstName: new FormControl('', [Validators.required, Validators.minLength(this.fieldMin)]),
        lastName: new FormControl('', [Validators.required, Validators.maxLength(this.fieldMax)]),
        email: new FormControl('', [Validators.required, Validators.email]),
        confirmEmail: new FormControl('', [Validators.required, Validators.email]),
        phone: new FormControl(''),
        rating: new FormControl('', ratingRange(1, 5)),
        notification: new FormControl('email'),
        sendCatalog: new FormControl(true),
        addresses: new FormArray([this.buildAddress()]),
    }, [matchInputs('email', 'confirmEmail')])

    fc = this.customerForm.controls

    constructor () { }

    ngOnInit (): void {
        this.subs.push(
            this.fc.firstName.valueChanges
                .pipe(debounceTime(this.inputDelay))
                .subscribe(() => this.errorMessages(this.fc.firstName, 'firstName'))
        )

        this.subs.push(
            this.fc.lastName.valueChanges
                .pipe(debounceTime(this.inputDelay))
                .subscribe(() => this.errorMessages(this.fc.lastName, 'lastName'))
        )

        this.subs.push(
            this.fc.email.valueChanges
                .pipe(debounceTime(this.inputDelay))
                .subscribe(() => {
                    this.errorMessages(this.fc.email, 'email')
                    this.errorMessages(this.fc.confirmEmail, 'confirmEmail', this.messageEmailMatch)
                })
        )

        this.subs.push(
            this.fc.confirmEmail.valueChanges
                .pipe(debounceTime(this.inputDelay))
                .subscribe(() => this.errorMessages(this.fc.confirmEmail, 'confirmEmail', this.messageEmailMatch))
        )

        this.subs.push(
            this.fc.notification.valueChanges
                .subscribe((value: string | null) => this.setNotification(value!))
        )

        this.subs.push(
            this.fc.phone.valueChanges
                .pipe(debounceTime(this.inputDelay))
                .subscribe(() => this.errorMessages(this.fc.phone, 'phone'))
        )

        this.subs.push(
            this.fc.rating.valueChanges
                .pipe(debounceTime(this.inputDelay))
                .subscribe(() => this.errorMessages(this.fc.rating, 'rating'))
        )
    }

    save (): void {
        console.log(this.customerForm);                                                                     // TODO
        console.log('Saved: ' + JSON.stringify(this.customerForm.value));
    }

    setNotification (via: string): void {
        const phoneControl = this.fc.phone
        if (via === 'text') {
            phoneControl.setValidators(Validators.required)
        } else { phoneControl.clearValidators() }
        phoneControl.updateValueAndValidity()
    }

    errorMessages (control: AbstractControl, name: string, formErr?: (control: AbstractControl) => void): void {
        // @ts-ignore
        this.formMessages[name] = ''
        if ((control.touched || control.dirty) && control.errors) {
            // @ts-ignore
            this.formMessages[name] = Object.keys(control.errors)
                .map(key => this.validationMessages[key])
                .join(' ')
        }
        if (formErr) formErr(control)
    }

    messageEmailMatch = (control: AbstractControl) => {
        this.formMessages.matchEmails = ''
        if ((control.touched || control.dirty) && this.customerForm.errors && this.customerForm.errors['match']) {
            this.formMessages.matchEmails = this.validationMessages['match']
            this.formMessages.confirmEmail += this.formMessages.matchEmails
        }
    }

    buildAddress() : FormGroup {
        return new FormGroup({
            addressType: new FormControl('home'),
            street1: new FormControl(''),
            street2: new FormControl(''),
            city: new FormControl(''),
            state: new FormControl(''),
            zip: new FormControl(''),
        })
    }

    addAddress(): void {
        this.fc.addresses.push(this.buildAddress())
    }

    ngOnDestroy (): void {
        this.subs.forEach(sub => sub.unsubscribe())
    }
}
